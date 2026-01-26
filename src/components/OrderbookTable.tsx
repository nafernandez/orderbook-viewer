import { useMemo } from 'react';
import type { OrderLevel, SpreadData } from '@/types';
import { getPriceDecimals, getQuantityDecimals } from '@/utils';
import { OrderBookRow } from './OrderBookRow';
import { SpreadIndicator } from './SpreadIndicator';

interface OrderbookTableProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spreadData: SpreadData | null;
  symbol: string | null;
}

export function OrderbookTable({ bids, asks, spreadData, symbol }: OrderbookTableProps) {
  const maxBidDepth = useMemo(() => {
    return bids.length > 0 ? bids[bids.length - 1].depth : 1;
  }, [bids]);

  const maxAskDepth = useMemo(() => {
    return asks.length > 0 ? asks[asks.length - 1].depth : 1;
  }, [asks]);

  const samplePrice = asks[0]?.price || bids[0]?.price || 1;
  const priceDecimals = getPriceDecimals(samplePrice);
  const quantityDecimals = getQuantityDecimals();

  return (
    <div className="w-full max-w-2xl mx-auto border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-zinc-100">Order Book</span>
          {symbol && (
            <span className="text-xs text-zinc-400 font-normal">
              {symbol}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700 bg-zinc-800/30">
        <span className="text-left">Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>
      <div className="overflow-hidden">
        {[...asks].reverse().map((entry, index) => (
          <OrderBookRow
            key={`ask-${entry.price}-${index}`}
            entry={entry}
            maxTotal={maxAskDepth}
            type="ask"
            priceDecimals={priceDecimals}
            quantityDecimals={quantityDecimals}
          />
        ))}
      </div>
      <SpreadIndicator spreadData={spreadData} />
      <div className="overflow-hidden">
        {bids.map((entry, index) => (
          <OrderBookRow
            key={`bid-${entry.price}-${index}`}
            entry={entry}
            maxTotal={maxBidDepth}
            type="bid"
            priceDecimals={priceDecimals}
            quantityDecimals={quantityDecimals}
          />
        ))}
      </div>
    </div>
  );
}
