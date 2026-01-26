export interface OrderLevel {
  price: number;
  qty: number;
  total: number;
  depth: number;
}

export interface SpreadData {
  spread: number;
  spreadPercent: number;
  midPrice: number;
}
