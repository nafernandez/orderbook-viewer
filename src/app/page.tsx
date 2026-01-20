'use client';

import { useState } from 'react';
import { AssetSelector } from '@/components/AssetSelector';
import { OrderbookTable } from '@/components/OrderbookTable';

const mockBids = [
  { price: 42995, qty: 0.31 },
  { price: 42990, qty: 0.18 },
  { price: 42985, qty: 0.52 },
  { price: 42980, qty: 0.09 },
  { price: 42975, qty: 0.41 },
  { price: 42970, qty: 0.27 },
  { price: 42965, qty: 0.63 },
  { price: 42960, qty: 0.14 },
  { price: 42955, qty: 0.36 },
  { price: 42950, qty: 0.22 },
];

const mockAsks = [
  { price: 43005, qty: 0.19 },
  { price: 43010, qty: 0.44 },
  { price: 43015, qty: 0.08 },
  { price: 43020, qty: 0.57 },
  { price: 43025, qty: 0.33 },
  { price: 43030, qty: 0.12 },
  { price: 43035, qty: 0.61 },
  { price: 43040, qty: 0.26 },
  { price: 43045, qty: 0.49 },
  { price: 43050, qty: 0.17 },
];

export default function Home() {
  const [symbol, setSymbol] = useState<string | null>(null);

  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <AssetSelector onChange={setSymbol} />

      {symbol && (
        <p className="text-sm text-zinc-500">
          Selected pair: {symbol}
        </p>
      )}
      <OrderbookTable bids={mockBids} asks={mockAsks} />
    </main>
  );
}