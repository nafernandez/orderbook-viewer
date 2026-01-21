import { OrderLevel } from '@/lib/orderbook';
import { formatPrice } from '@/lib/format';

interface SpreadIndicatorProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export function SpreadIndicator({ bids, asks }: SpreadIndicatorProps) {
  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  const spread = bestBid && bestAsk ? bestAsk - bestBid : null;

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-md">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-zinc-400 font-medium">Spread:</span>
        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          {spread !== null ? formatPrice(spread) : '—'}
        </span>
      </div>
    </div>
  );
}
