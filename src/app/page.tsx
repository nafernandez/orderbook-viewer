'use client';

import { useState } from 'react';
import { AssetSelector } from '@/components/AssetSelector';

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
    </main>
  );
}