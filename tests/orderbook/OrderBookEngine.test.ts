import { describe, expect, it, beforeEach } from 'vitest';
import { OrderBookEngine } from '@/orderbook/OrderBookEngine';
import type { DepthResponse, DepthUpdateEvent } from '@/types';

const baseSnapshot: DepthResponse = {
  lastUpdateId: 100,
  bids: [
    ['100.0', '2'],
    ['99.5', '1'],
  ],
  asks: [
    ['101.0', '1.5'],
    ['102.0', '0.5'],
  ],
};

function makeUpdate(
  overrides: Partial<DepthUpdateEvent> = {}
): DepthUpdateEvent {
  return {
    e: 'depthUpdate',
    E: Date.now(),
    s: 'BTCUSDT',
    U: 101,
    u: 102,
    b: [],
    a: [],
    ...overrides,
  };
}

describe('OrderBookEngine', () => {
  let engine: OrderBookEngine;

  beforeEach(() => {
    engine = new OrderBookEngine();
    engine.applySnapshot(baseSnapshot);
  });

  it('builds top levels from snapshot with depth accumulation', () => {
    const { bids, asks } = engine.getTopLevels(2);
    expect(bids[0]).toMatchObject({
      price: 100,
      qty: 2,
      total: 200,
      depth: 200,
    });
    expect(asks[0]).toMatchObject({
      price: 101,
      qty: 1.5,
      total: 151.5,
      depth: 151.5,
    });
  });

  it('applies diffs in order and updates lastUpdateId', () => {
    const result = engine.applyDiff(
      makeUpdate({
        U: 101,
        u: 101,
        b: [['100.0', '1.5']],
      })
    );
    expect(result).toBe('applied');
    const { bids } = engine.getTopLevels(1);
    expect(bids[0].qty).toBe(1.5);
    expect(engine.getLastUpdateId()).toBe(101);
  });

  it('returns stale for updates at or below lastUpdateId', () => {
    const result = engine.applyDiff(
      makeUpdate({
        U: 80,
        u: 80,
        b: [['100.0', '5']],
      })
    );
    expect(result).toBe('stale');
    const { bids } = engine.getTopLevels(1);
    expect(bids[0].qty).toBe(2);
  });

  it('returns gap when update sequence skips values', () => {
    const result = engine.applyDiff(
      makeUpdate({
        U: 200,
        u: 205,
      })
    );
    expect(result).toBe('gap');
  });

  it('removes levels when qty becomes zero', () => {
    const result = engine.applyDiff(
      makeUpdate({
        U: 101,
        u: 101,
        b: [['100.0', '0']],
      })
    );
    expect(result).toBe('applied');
    const { bids } = engine.getTopLevels(2);
    expect(bids.find((level) => level.price === 100)).toBeUndefined();
  });
});
