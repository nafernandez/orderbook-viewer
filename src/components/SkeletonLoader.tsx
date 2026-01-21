export function DropdownSkeleton() {
  return (
    <div className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded animate-pulse">
      <div className="h-5 w-24 bg-zinc-700 rounded"></div>
    </div>
  );
}

export function OrderbookSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-zinc-100">Order Book</span>
          <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Column headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700 bg-zinc-800/30">
        <span className="text-left">Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks rows - 10 rows */}
      <div className="overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={`ask-skeleton-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1.5">
            <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-zinc-700 rounded ml-auto animate-pulse"></div>
            <div className="h-4 w-16 bg-zinc-700 rounded ml-auto animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="bg-zinc-900 border-y border-zinc-700 py-3 px-4">
        <div className="h-4 w-40 bg-zinc-700 rounded mx-auto animate-pulse"></div>
      </div>

      {/* Bids rows - 10 rows */}
      <div className="overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={`bid-skeleton-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1.5">
            <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-zinc-700 rounded ml-auto animate-pulse"></div>
            <div className="h-4 w-16 bg-zinc-700 rounded ml-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
