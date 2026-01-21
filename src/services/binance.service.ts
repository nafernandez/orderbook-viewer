import type { ExchangeInfo, DepthResponse } from '@/types';

const BINANCE_API_BASE = 'https://api.binance.com';

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const url = `${BINANCE_API_BASE}/api/v3/exchangeInfo`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al obtener información del exchange: ${response.status} ${response.statusText}. ${errorText}`
    );
  }
  
  const data = await response.json();
  return data as ExchangeInfo;
}

export async function getDepth(
  symbol: string,
  limit: number = 100,
  signal?: AbortSignal
): Promise<DepthResponse> {
  const url = `${BINANCE_API_BASE}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
  
  const response = await fetch(url, { signal });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al obtener depth para ${symbol}: ${response.status} ${response.statusText}. ${errorText}`
    );
  }
  
  const data = await response.json();
  return data as DepthResponse;
}
