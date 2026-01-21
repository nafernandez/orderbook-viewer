import { OrderLevel } from '@/lib/orderbook';

interface OrderbookTableProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

export function OrderbookTable({ bids, asks }: OrderbookTableProps) {
  const renderRows = (levels: OrderLevel[]) => {
    const rows = [];
    for (let i = 0; i < 10; i++) {
      const level = levels[i];
      rows.push(
        <tr key={level ? level.price : `empty-${i}`} className="h-8">
          <td className="px-3 py-1 text-sm font-mono tabular-nums text-right">
            {level ? level.price.toFixed(2) : '—'}
          </td>
          <td className="px-3 py-1 text-sm font-mono tabular-nums text-right">
            {level ? level.qty.toFixed(4) : '—'}
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
            {renderRows(bids)}
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
            {renderRows(asks)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
