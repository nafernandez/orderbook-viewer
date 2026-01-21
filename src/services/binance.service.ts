import { ExchangeInfo, DepthResponse, BinanceSymbol } from '@/types';

const BINANCE_API_BASE = 'https://api.binance.com';

const DEFAULT_TRADING_PAIRS: BinanceSymbol[] = [
  {
    symbol: 'BTCUSDT',
    status: 'TRADING',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
  },
  {
    symbol: 'ETHUSDT',
    status: 'TRADING',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
  },
  {
    symbol: 'BNBUSDT',
    status: 'TRADING',
    baseAsset: 'BNB',
    quoteAsset: 'USDT',
  },
  {
    symbol: 'SOLUSDT',
    status: 'TRADING',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
  },
  {
    symbol: 'XRPUSDT',
    status: 'TRADING',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
  },
  {
    symbol: 'ADAUSDT',
    status: 'TRADING',
    baseAsset: 'ADA',
    quoteAsset: 'USDT',
  },
];

export async function getExchangeInfo(): Promise<ExchangeInfo> {
  const url = `${BINANCE_API_BASE}/api/v3/exchangeInfo`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as ExchangeInfo;
  } catch (error) {
    console.warn('Error al conectar con la API de Binance, usando pares por defecto:', error);
    return {
      timezone: 'UTC',
      serverTime: Date.now(),
      symbols: DEFAULT_TRADING_PAIRS,
    };
  }
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
