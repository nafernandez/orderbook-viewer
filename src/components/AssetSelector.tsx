'use client';

import { useState, useEffect } from 'react';
import { getExchangeInfo } from '@/lib/binance';

interface AssetSelectorProps {
  onChange: (symbol: string) => void;
}

export function AssetSelector({ onChange }: AssetSelectorProps) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSymbols = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const exchangeInfo = await getExchangeInfo();
      
      const tradingSymbols = exchangeInfo.symbols
        .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
        .slice(0, 5)
        .map(s => s.symbol);

      setSymbols(tradingSymbols);
      
      if (tradingSymbols.length > 0) {
        setSelectedSymbol(tradingSymbols[0]);
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

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-red-600">
          Trading pair
        </label>
        <div className="text-sm text-red-600">{error}</div>
        <button
          onClick={fetchSymbols}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="asset-selector" className="block text-sm font-medium text-gray-700">
        Trading pair
      </label>
      <select
        id="asset-selector"
        value={selectedSymbol}
        onChange={handleChange}
        disabled={isLoading}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <option>Loading pairs…</option>
        ) : (
          symbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
