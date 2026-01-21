import { useMemo } from 'react';
import { OrderLevel } from '@/lib/orderbook';
import { formatPrice, formatQty } from '@/lib/format';

interface OrderbookTableProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export function OrderbookTable({ bids, asks }: OrderbookTableProps) {
  const maxQty = useMemo(() => {
    const allQtys = [
      ...bids.slice(0, 10).map(level => level?.qty || 0),
      ...asks.slice(0, 10).map(level => level?.qty || 0),
    ];
    return Math.max(...allQtys, 1);
  }, [bids, asks]);

  const renderRows = (levels: OrderLevel[], side: 'bid' | 'ask') => {
    const rows = [];
    
    for (let i = 0; i < 10; i++) {
      const level = levels[i];
      const widthPercent = level && maxQty > 0 ? (level.qty / maxQty) * 100 : 0;
      
      rows.push(
        <tr key={level ? level.price : `empty-${i}`} className="h-8 relative">
          {widthPercent > 0 && (
            <td 
              className="absolute inset-0 pointer-events-none"
              colSpan={2}
            >
              <div 
                className={`h-full ${side === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                style={{ 
                  width: `${widthPercent}%`,
                  float: 'right'
                }}
              />
            </td>
          )}
          <td className="px-3 py-1 text-sm font-mono tabular-nums text-right relative z-10">
            {level ? formatPrice(level.price) : '—'}
          </td>
          <td className="px-3 py-1 text-sm font-mono tabular-nums text-right relative z-10">
            {level ? formatQty(level.qty) : '—'}
          </td>
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-gray-700 rounded">
        <div className="px-3 py-2 border-b border-gray-700 text-xs font-semibold text-green-400">
          Bids
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-3 py-2 text-xs font-semibold text-gray-400 text-right">
                Price
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-400 text-right">
                Qty
              </th>
            </tr>
          </thead>
          <tbody className="text-green-500">
            {renderRows(bids, 'bid')}
          </tbody>
        </table>
      </div>
      <div className="border border-gray-700 rounded">
        <div className="px-3 py-2 border-b border-gray-700 text-xs font-semibold text-red-400">
          Asks
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-3 py-2 text-xs font-semibold text-gray-400 text-right">
                Price
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-400 text-right">
                Qty
              </th>
            </tr>
          </thead>
          <tbody className="text-red-500">
            {renderRows(asks, 'ask')}
          </tbody>
        </table>
      </div>
    </div>
  );
}
