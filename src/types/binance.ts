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
