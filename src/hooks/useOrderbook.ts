'use client';

import { useEffect, useRef, useState } from 'react';
import { getDepth } from '@/lib/binance';
import { parseOrderbookLevels, type OrderLevel } from '@/lib/orderbook';

export function useOrderbook(symbol: string | null, limit = 10) {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setBids([]);
    setAsks([]);
    setError(null);

    if (!symbol) return;

    const currentSymbol = symbol;

    async function fetchData() {
      setIsFetching(true);
      try {
        const data = await getDepth(currentSymbol, limit);
        setBids(parseOrderbookLevels(data.bids).slice(0, 10));
        setAsks(parseOrderbookLevels(data.asks).slice(0, 10));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        if (intervalRef.current) clearInterval(intervalRef.current);
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
    intervalRef.current = window.setInterval(fetchData, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol, limit, retryCount]);

  function retry() {
    setError(null);
    setRetryCount((c) => c + 1);
  }

  const hasData = bids.length > 0 || asks.length > 0;

  return {
    bids,
    asks,
    error,
    retry,
    isLoading: isFetching && !hasData,
    isUpdating: isFetching && hasData,
  };
}
