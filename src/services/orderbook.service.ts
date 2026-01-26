import type { OrderLevel, SpreadData } from '@/types';

export function parseOrderbookLevels(levels: [string, string][]): OrderLevel[] {
  let cumulative = 0;
  return levels.map(([price, qty]) => {
    cumulative += Number(qty);
    return {
      price: Number(price),
      qty: Number(qty),
      total: cumulative,
      depth: cumulative,
    };
  });
}

export function calculateSpread(bids: OrderLevel[], asks: OrderLevel[]): SpreadData | null {
  if (bids.length === 0 || asks.length === 0) {
    return null;
  }
  
  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadPercent = (spread / midPrice) * 100;
  
  if (spread < 0) {
    return null;
  }
  
  return {
    spread,
    spreadPercent,
    midPrice,
  };
}
