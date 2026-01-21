import type { OrderLevel } from '@/types';

interface OrderBookRowProps {
  entry: OrderLevel;
  maxTotal: number;
  type: 'bid' | 'ask';
  priceDecimals: number;
  quantityDecimals: number;
}

export function OrderBookRow({
  entry,
  maxTotal,
  type,
  priceDecimals,
  quantityDecimals,
}: OrderBookRowProps) {
  const depthPercent = (entry.total / maxTotal) * 100;
  const isBid = type === 'bid';

  return (
    <div className="relative group">
      <div
        className={`absolute inset-y-0 transition-all duration-150 right-0 ${
          isBid ? ' bg-green-500/10' : 'bg-red-500/10'
        }`}
        style={{ width: `${Math.min(depthPercent, 100)}%` }}
      />
      <div className="relative grid grid-cols-3 gap-2 px-3 py-1.5 text-xs font-mono hover:bg-zinc-800/50 transition-colors cursor-pointer">
        <span className={`text-left ${isBid ? 'text-green-500' : 'text-red-500'}`}>
          {entry.price.toFixed(priceDecimals)}
        </span>
        <span className="text-right text-zinc-100">
          {entry.qty.toFixed(quantityDecimals)}
        </span>
        <span className="text-right text-zinc-400">
          {entry.total.toFixed(quantityDecimals)}
        </span>
      </div>
    </div>
  );
}
