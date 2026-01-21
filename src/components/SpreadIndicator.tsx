import { type SpreadData } from '@/lib/orderbook';
import { formatPrice } from '@/lib/format';

interface SpreadIndicatorProps {
  spreadData: SpreadData | null;
}

export function SpreadIndicator({ spreadData }: SpreadIndicatorProps) {
  if (!spreadData) {
    return (
      <div className="bg-zinc-900 border-y border-zinc-700 py-3 px-4">
        <div className="flex items-center justify-center">
          <span className="text-sm text-zinc-500">—</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border-y border-zinc-700 py-3 px-4">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Spread:</span>
          <span className="font-mono text-sm font-medium text-zinc-100">
            {formatPrice(spreadData.spread)}
          </span>
          <span className="text-xs text-zinc-500">
            ({spreadData.spreadPercent.toFixed(4)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
