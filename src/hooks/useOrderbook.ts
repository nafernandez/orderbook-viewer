'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getDepth } from '@/services';
import { OrderLevel } from '@/types';
import { useBinanceDepth, DepthUpdateEvent } from './useBinanceDepth';

interface OrderbookState {
  bids: Map<number, number>;
  asks: Map<number, number>;
}

export function useOrderbook(symbol: string | null, limit = 10) {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const orderbookStateRef = useRef<OrderbookState>({
    bids: new Map(),
    asks: new Map(),
  });
  const lastUpdateIdRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const currentSymbolRef = useRef<string | null>(null);
  const isResyncingRef = useRef(false);
  const eventBufferRef = useRef<DepthUpdateEvent[]>([]);

  const updateVisualState = useCallback(() => {
    const { bids: bidsMap, asks: asksMap } = orderbookStateRef.current;

    const bidsArray = Array.from(bidsMap.entries())
      .map(([price, qty]) => ({ 
        price, 
        qty, 
        total: price * qty,
        depth: 0
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);

    let bidDepth = 0;
    bidsArray.forEach((level) => {
      bidDepth += level.total;
      level.depth = bidDepth;
    });

    const asksArray = Array.from(asksMap.entries())
      .map(([price, qty]) => ({ 
        price, 
        qty, 
        total: price * qty,
        depth: 0
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, limit);

    let askDepth = 0;
    asksArray.forEach((level) => {
      askDepth += level.total;
      level.depth = askDepth;
    });

    setBids(bidsArray);
    setAsks(asksArray);
  }, [limit]);

  const processUpdate = useCallback((update: DepthUpdateEvent) => {
    const { bids: bidsMap, asks: asksMap } = orderbookStateRef.current;

    update.b.forEach(([price, qty]) => {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);
      
      if (qtyNum === 0) {
        bidsMap.delete(priceNum);
      } else {
        bidsMap.set(priceNum, qtyNum);
      }
    });

    update.a.forEach(([price, qty]) => {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);
      
      if (qtyNum === 0) {
        asksMap.delete(priceNum);
      } else {
        asksMap.set(priceNum, qtyNum);
      }
    });

    updateVisualState();
  }, [updateVisualState]);

  const handleDepthUpdate = useCallback((update: DepthUpdateEvent) => {
    const updateSymbol = update.s;
    const expectedSymbol = currentSymbolRef.current;
    
    if (updateSymbol !== expectedSymbol) {
      return;
    }

    if (!isInitializedRef.current) {
      eventBufferRef.current.push(update);
      return;
    }

    if (isResyncingRef.current) {
      return;
    }

    const lastUpdate = lastUpdateIdRef.current;
    
    if (update.u <= lastUpdate) {
      return;
    }
    
    if (update.pu !== undefined && update.pu !== lastUpdate) {
      
      isResyncingRef.current = true;
      setRetryCount((c) => c + 1);
      return;
    }
    
    if (update.U > lastUpdate + 1) {
      isResyncingRef.current = true;
      setRetryCount((c) => c + 1);
      return;
    }
    
    if (update.U <= lastUpdate + 1 && update.u > lastUpdate) {
      lastUpdateIdRef.current = update.u;
      
      processUpdate(update);
    } else {
      return;
    }
  }, [processUpdate]);

  useBinanceDepth(symbol, {
    updateSpeed: '1000ms',
    onUpdate: handleDepthUpdate,
    onError: () => setError('Error de conexión WebSocket'),
  });

  useEffect(() => {
    const isSymbolChange = currentSymbolRef.current !== symbol;
    const isResync = isResyncingRef.current && !isSymbolChange;
    
    isInitializedRef.current = false;
    
    if (!isResync) {
      isResyncingRef.current = false;
    }
    
    currentSymbolRef.current = symbol;
    
    eventBufferRef.current = [];
    
    if (isSymbolChange) {
      orderbookStateRef.current = {
        bids: new Map(),
        asks: new Map(),
      };
      lastUpdateIdRef.current = 0;

    } else if (isResync) {
      lastUpdateIdRef.current = 0;
    }

    if (!symbol) {
      return;
    }

    const currentSymbol = symbol;
    let isSubscribed = true;

    async function initializeOrderbook() {
      setIsLoading(true);
      
      try {
        const maxWaitTime = 2000;
        const startTime = Date.now();
        
        while (eventBufferRef.current.length === 0 && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const snapshot = await getDepth(currentSymbol, 100);
        
        if (!isSubscribed) {
          return;
        }

        lastUpdateIdRef.current = snapshot.lastUpdateId;

        const bidsMap = orderbookStateRef.current.bids.size > 0 && isResyncingRef.current
          ? orderbookStateRef.current.bids
          : new Map<number, number>();
        const asksMap = orderbookStateRef.current.asks.size > 0 && isResyncingRef.current
          ? orderbookStateRef.current.asks
          : new Map<number, number>();

        if (isResyncingRef.current && (bidsMap.size > 0 || asksMap.size > 0)) {
          bidsMap.clear();
          asksMap.clear();
        }

        snapshot.bids.forEach(([price, qty]) => {
          bidsMap.set(parseFloat(price), parseFloat(qty));
        });

        snapshot.asks.forEach(([price, qty]) => {
          asksMap.set(parseFloat(price), parseFloat(qty));
        });

        orderbookStateRef.current = {
          bids: bidsMap,
          asks: asksMap,
        };
        
        const validEvents: DepthUpdateEvent[] = [];
        
        for (const event of eventBufferRef.current) {
          if (event.u <= snapshot.lastUpdateId) {
            continue;
          }
          validEvents.push(event);
        }
        
        if (validEvents.length > 0) {
          const firstEvent = validEvents[0];
          if (firstEvent.U <= snapshot.lastUpdateId + 1 && firstEvent.u >= snapshot.lastUpdateId + 1) {
            for (const event of validEvents) {
              if (event.U > lastUpdateIdRef.current + 1) {
                console.warn('⚠️ Gap en buffer, descartando eventos restantes');
                break;
              }
              
              event.b.forEach(([price, qty]) => {
                const priceNum = parseFloat(price);
                const qtyNum = parseFloat(qty);
                if (qtyNum === 0) {
                  bidsMap.delete(priceNum);
                } else {
                  bidsMap.set(priceNum, qtyNum);
                }
              });
              
              event.a.forEach(([price, qty]) => {
                const priceNum = parseFloat(price);
                const qtyNum = parseFloat(qty);
                if (qtyNum === 0) {
                  asksMap.delete(priceNum);
                } else {
                  asksMap.set(priceNum, qtyNum);
                }
              });
              
              lastUpdateIdRef.current = event.u;
            }

          }
        }
        
        eventBufferRef.current = [];

        updateVisualState();

        isInitializedRef.current = true;
        isResyncingRef.current = false;
        
        setError(null);
        setIsLoading(false);
      } catch (e) {
        if (isSubscribed) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
          setIsLoading(false);
        }
      }
    }

    initializeOrderbook();

    return () => {
      isSubscribed = false;
    };
  }, [symbol, retryCount, updateVisualState]);

  function retry() {
    setError(null);
    setRetryCount((c) => c + 1);
  }

  return {
    bids,
    asks,
    error,
    retry,
    isLoading: !symbol || isLoading,
    isUpdating: false,
  };
}
