'use client';

import { useWebSocket } from './useWebSocket';

export interface DepthUpdateEvent {
  e: string;
  E: number;
  s: string;
  U: number;
  u: number;
  pu?: number;
  b: [string, string][];
  a: [string, string][];
}

interface UseBinanceDepthOptions {
  updateSpeed?: '100ms' | '1000ms';
  onUpdate: (data: DepthUpdateEvent) => void;
  onError?: (error: Event) => void;
}

export function useBinanceDepth(
  symbol: string | null,
  options: UseBinanceDepthOptions
) {
  const { updateSpeed = '1000ms', onUpdate, onError } = options;

  const url = symbol
    ? `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@${updateSpeed}`
    : null;

  return useWebSocket<DepthUpdateEvent>(url, onUpdate, {
    reconnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 1000,
    onError,
  });
}
