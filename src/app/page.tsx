'use client';

import { useState, useMemo } from 'react';
import { AssetSelector } from '@/components/AssetSelector';
import { OrderbookTable } from '@/components/OrderbookTable';
import { OrderbookSkeleton } from '@/components/SkeletonLoader';
import { useOrderbook } from '@/hooks';
import { calculateSpread } from '@/services';

export default function Home() {
  const [symbol, setSymbol] = useState<string | null>(null);
  const { bids, asks, isLoading, isUpdating, error, retry } = useOrderbook(
    symbol,
    10
  );

  const spreadData = useMemo(() => calculateSpread(bids, asks), [bids, asks]);

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-zinc-100">Orderbook Viewer</h1>
            <AssetSelector onChange={setSymbol} />
          </div>

          {symbol && (
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                isUpdating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span className="text-xs text-zinc-400">
                {isUpdating ? 'Updating...' : 'Connected'}
              </span>
            </div>
          )}
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-400">Error</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={retry}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <OrderbookSkeleton />
        ) : (
          <OrderbookTable 
            bids={bids} 
            asks={asks} 
            spreadData={spreadData}
            symbol={symbol}
          />
        )}
      </div>
    </main>
  );
}