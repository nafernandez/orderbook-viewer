'use client';

import { useState } from 'react';
import { AssetSelector } from '@/components/AssetSelector';
import { OrderbookTable } from '@/components/OrderbookTable';
import { SpreadIndicator } from '@/components/SpreadIndicator';
import { useOrderbook } from '@/hooks/useOrderbook';

export default function Home() {
  const [symbol, setSymbol] = useState<string | null>(null);
  const { bids, asks, isLoading, isUpdating, error, retry } = useOrderbook(
    symbol,
    10
  );

  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <AssetSelector onChange={setSymbol} />

      {symbol && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">Selected pair: {symbol}</p>
          {isUpdating && (
            <p className="text-xs text-blue-400 animate-pulse">
              Updating…
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-4">
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-zinc-500">Loading orderbook…</p>
          </div>
        </div>
      ) : (
        <>
          <SpreadIndicator bids={bids} asks={asks} />
          <OrderbookTable bids={bids} asks={asks} />
        </>
      )}
    </main>
  );
}