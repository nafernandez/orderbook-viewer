export interface OrderLevel {
  price: number;
  qty: number;
}

export function parseOrderbookLevels(levels: [string, string][]): OrderLevel[] {
  return levels.map(([price, qty]) => ({
    price: Number(price),
    qty: Number(qty),
  }));
}

