'use client';

import { useState, useEffect } from 'react';
import { getExchangeInfo } from '@/services';
import { AssetSelectorProps, SymbolInfo, BinanceSymbol } from '@/types';
import { DropdownSkeleton } from './SkeletonLoader';

export function AssetSelector({ onChange }: AssetSelectorProps) {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSymbols = async () => {
      setIsLoading(true);

      try {
        const exchangeInfo = await getExchangeInfo();
        
        const tradingSymbols = exchangeInfo.symbols
          .filter((s: BinanceSymbol) => s.status === 'TRADING' && s.quoteAsset === 'USDT')
          .slice(0, 6)
          .map((s: BinanceSymbol) => ({
            symbol: s.symbol,
            displayName: `${s.baseAsset}/${s.quoteAsset}`
          }));

        setSymbols(tradingSymbols);
        
        if (tradingSymbols.length > 0) {
          const initialSymbol = tradingSymbols[0].symbol;
          setSelectedSymbol(initialSymbol);
          onChange(initialSymbol);
        }
      } catch (err) {
        console.error('Error inesperado al cargar símbolos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSymbols();
  }, [onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = event.target.value;
    setSelectedSymbol(newSymbol);
    onChange(newSymbol);
  };

  if (isLoading) {
    return <DropdownSkeleton />;
  }

  return (
    <select
      id="asset-selector"
      value={selectedSymbol}
      onChange={handleChange}
      className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-zinc-700 transition-colors"
    >
      {symbols.map((symbolInfo) => (
        <option key={symbolInfo.symbol} value={symbolInfo.symbol} className="bg-zinc-800">
          {symbolInfo.displayName}
        </option>
      ))}
    </select>
  );
}
