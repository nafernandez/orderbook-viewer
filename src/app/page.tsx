'use client';

import { useMemo, useState } from 'react';
import { AssetSelector } from '@/components/AssetSelector';
import { OrderbookTable } from '@/components/OrderbookTable';
import { OrderbookSkeleton } from '@/components/SkeletonLoader';
import { useOrderbook } from '@/hooks';
import { calculateSpread } from '@/services';

export default function Home() {
  const [symbol, setSymbol] = useState<string | null>(null);
  const { bids, asks, isLoading } = useOrderbook(
    symbol,
    10
  );
  const spreadData = useMemo(() => {
    if (!symbol) return null;
    
    return calculateSpread(bids, asks);
  }, [bids, asks, symbol]);

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-zinc-100">Pair</h1>
            <AssetSelector onChange={setSymbol} />
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
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