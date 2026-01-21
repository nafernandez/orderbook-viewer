'use client';

import { useState, useEffect } from 'react';
import { getExchangeInfo } from '@/services';
import { AssetSelectorProps, SymbolInfo, BinanceSymbol } from '@/types';
import { DropdownSkeleton } from './SkeletonLoader';

export function AssetSelector({ onChange }: AssetSelectorProps) {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSymbols = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const exchangeInfo = await getExchangeInfo();
      
      const tradingSymbols = exchangeInfo.symbols
      // Only include symbols that are currently active and available for trading
        .filter((s: BinanceSymbol) => s.status === 'TRADING')
        .slice(0, 5)
        .map((s: BinanceSymbol) => ({
          symbol: s.symbol,
          displayName: `${s.baseAsset}/${s.quoteAsset}`
        }));

      setSymbols(tradingSymbols);
      
      if (tradingSymbols.length > 0) {
        setSelectedSymbol(tradingSymbols[0].symbol);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pares de trading');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSymbols();
  }, []);

  useEffect(() => {
    if (selectedSymbol) onChange(selectedSymbol);
  }, [selectedSymbol, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = event.target.value;
    setSelectedSymbol(newSymbol);
    onChange(newSymbol);
  };

  if (isLoading) {
    return <DropdownSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-red-400">{error}</div>
        <button
          onClick={fetchSymbols}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-700 rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
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
