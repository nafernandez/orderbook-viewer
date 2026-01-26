'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderBookEngine } from '@/orderbook/OrderBookEngine';
import { useErrorToast } from '@/provider/ErrorToastProvider';
import { getDepth } from '@/services';
import type { DepthUpdateEvent, OrderLevel } from '@/types';
import { useBinanceDepth } from './useBinanceDepth';

export function useOrderbook(symbol: string | null, limit = 10) {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { showError } = useErrorToast();

  const engineRef = useRef<OrderBookEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new OrderBookEngine();
  }

  const currentSymbolRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const isResyncingRef = useRef(false);
  const eventBufferRef = useRef<DepthUpdateEvent[]>([]);

  const updateVisualState = useCallback(() => {
    if (!engineRef.current) {
      return;
    }

    const snapshot = engineRef.current.getTopLevels(limit);
    setBids(snapshot.bids);
    setAsks(snapshot.asks);
  }, [limit]);

  const handleGap = useCallback(() => {
    isResyncingRef.current = true;
    setRetryCount((c) => c + 1);
  }, []);

  const handleDepthUpdate = useCallback(
    (update: DepthUpdateEvent) => {
      const expectedSymbol = currentSymbolRef.current;
      if (!expectedSymbol || update.s !== expectedSymbol) {
        return;
      }

      if (!isInitializedRef.current) {
        eventBufferRef.current.push(update);
        return;
      }

      if (isResyncingRef.current || !engineRef.current) {
        return;
      }

      const result = engineRef.current.applyDiff(update);

      if (result === 'gap') {
        handleGap();
        return;
      }

      if (result === 'applied') {
        updateVisualState();
      }
    },
    [handleGap, updateVisualState]
  );

  useBinanceDepth(symbol, {
    updateSpeed: '1000ms',
    onUpdate: handleDepthUpdate,
    onError: () => setError('Error de conexion WebSocket'),
  });

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new OrderBookEngine();
    }
  }, []);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    const isSymbolChange = currentSymbolRef.current !== symbol;
    const isResync = isResyncingRef.current && !isSymbolChange;

    isInitializedRef.current = false;

    if (!isResync) {
      isResyncingRef.current = false;
    }

    currentSymbolRef.current = symbol;
    eventBufferRef.current = [];

    if (!symbol) {
      engineRef.current.reset();
      updateVisualState();
      return;
    }

    if (isSymbolChange || isResync) {
      engineRef.current.reset();
    }

    const currentSymbol = symbol;
    let isSubscribed = true;

    async function initializeOrderbook() {
      setIsLoading(true);

      try {
        const maxWaitTime = 2000;
        const startTime = Date.now();

        while (
          eventBufferRef.current.length === 0 &&
          Date.now() - startTime < maxWaitTime
        ) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const snapshot = await getDepth(currentSymbol, 100);

        if (!isSubscribed || !engineRef.current) {
          return;
        }

        engineRef.current.applySnapshot(snapshot);

        const bufferedEvents = eventBufferRef.current;
        eventBufferRef.current = [];

        let requireResync = false;

        for (const event of bufferedEvents) {
          if (event.s !== currentSymbol) {
            continue;
          }

          const result = engineRef.current.applyDiff(event);
          if (result === 'gap') {
            requireResync = true;
            break;
          }
        }

        if (requireResync) {
          handleGap();
          return;
        }

        updateVisualState();

        isInitializedRef.current = true;
        isResyncingRef.current = false;
        setError(null);
        setIsLoading(false);
      } catch (e) {
        if (isSubscribed) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
          showError();
          setIsLoading(false);
        }
      }
    }

    initializeOrderbook();

    return () => {
      isSubscribed = false;
    };
  }, [symbol, retryCount, updateVisualState, showError, handleGap]);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }
    if (!isInitializedRef.current) {
      return;
    }
    updateVisualState();
  }, [limit, updateVisualState]);

  function dismissError() {
    setError(null);
  }

  return {
    bids,
    asks,
    error,
    dismissError,
    isLoading: !symbol || isLoading,
    isUpdating: false,
  };
}
