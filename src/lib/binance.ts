const BINANCE_API_BASE = 'https://api.binance.com';

export interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  symbols: BinanceSymbol[];
}

export interface DepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

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
  limit: number = 100
): Promise<DepthResponse> {
  const url = `${BINANCE_API_BASE}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al obtener depth para ${symbol}: ${response.status} ${response.statusText}. ${errorText}`
    );
  }
  
  const data = await response.json();
  return data as DepthResponse;
}
