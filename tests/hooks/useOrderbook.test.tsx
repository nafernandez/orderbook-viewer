import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ErrorToastProvider } from '@/provider/ErrorToastProvider';
import { useOrderbook } from '@/hooks';
import type { DepthResponse, DepthUpdateEvent } from '@/types';
import { getDepth } from '@/services';

vi.mock('@/services', async () => {
  const actual = await vi.importActual<typeof import('@/services')>('@/services');
  return {
    ...actual,
    getDepth: vi.fn(),
  };
});

const mockGetDepth = vi.mocked(getDepth);

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  public onopen: (() => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onclose: (() => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  constructor(public url: string) {
    MockWebSocket.instances.push(this);
    queueMicrotask(() => {
      this.onopen?.();
    });
  }

  emitMessage(data: DepthUpdateEvent) {
    this.onmessage?.({
      data: JSON.stringify(data),
    });
  }

  close() {
    this.onclose?.();
  }

  static reset() {
    MockWebSocket.instances.splice(0, MockWebSocket.instances.length);
  }
}

Object.assign(globalThis, {
  WebSocket: MockWebSocket,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorToastProvider>{children}</ErrorToastProvider>
);

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

function createDepthResponse(
  overrides: Partial<DepthResponse> = {}
): DepthResponse {
  return {
    lastUpdateId: 100,
    bids: [['100.0', '1']],
    asks: [['200.0', '1']],
    ...overrides,
  };
}

function createUpdate(overrides: Partial<DepthUpdateEvent> = {}): DepthUpdateEvent {
  return {
    e: 'depthUpdate',
    E: Date.now(),
    s: 'BTCUSDT',
    U: 101,
    u: 101,
    b: [],
    a: [],
    ...overrides,
  };
}

describe('useOrderbook integration', () => {
  beforeEach(() => {
    mockGetDepth.mockReset();
    MockWebSocket.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('buffers events until snapshot and syncs the book', async () => {
    const deferred = createDeferred<DepthResponse>();
    mockGetDepth.mockReturnValueOnce(deferred.promise);

    const { result, unmount } = renderHook(
      () => useOrderbook('BTCUSDT', 5),
      { wrapper }
    );

    await waitFor(() => expect(MockWebSocket.instances.length).toBe(1));

    act(() => {
      MockWebSocket.instances[0].emitMessage(
        createUpdate({
          U: 101,
          u: 102,
          b: [['101.0', '2']],
        })
      );
    });

    deferred.resolve(
      createDepthResponse({
        lastUpdateId: 101,
        bids: [['100.0', '1']],
        asks: [['200.0', '1']],
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bids[0].price).toBe(101);
    expect(result.current.bids[0].qty).toBe(2);
    unmount();
  });

  it('forces resync when detecting a sequence gap', async () => {
    mockGetDepth
      .mockResolvedValueOnce(
        createDepthResponse({
          lastUpdateId: 150,
          bids: [['100.0', '1']],
          asks: [['200.0', '1']],
        })
      )
      .mockResolvedValueOnce(
        createDepthResponse({
          lastUpdateId: 300,
          bids: [['110.0', '3']],
          asks: [['210.0', '1']],
        })
      );

    const { result, unmount } = renderHook(
      () => useOrderbook('BTCUSDT', 5),
      { wrapper }
    );

    await waitFor(() => expect(MockWebSocket.instances.length).toBe(1));

    act(() => {
      MockWebSocket.instances[0].emitMessage(
        createUpdate({
          U: 151,
          u: 151,
          b: [['101.0', '1']],
        })
      );
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetDepth).toHaveBeenCalledTimes(1);

    act(() => {
      MockWebSocket.instances[0].emitMessage(
        createUpdate({
          U: 400,
          u: 401,
        })
      );
    });

    await waitFor(() => expect(mockGetDepth).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bids[0].price).toBe(110);
    expect(result.current.bids[0].qty).toBe(3);
    unmount();
  });

  it('surfaces snapshot errors and stops loading', async () => {
    mockGetDepth.mockRejectedValueOnce(new Error('network'));

    const { result, unmount } = renderHook(
      () => useOrderbook('BTCUSDT', 5),
      { wrapper }
    );

    await waitFor(() => expect(MockWebSocket.instances.length).toBe(1));

    act(() => {
      MockWebSocket.instances[0].emitMessage(
        createUpdate({
          U: 101,
          u: 101,
          b: [['101.0', '1']],
        })
      );
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('network');
    unmount();
  });
});
