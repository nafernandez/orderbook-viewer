interface OrderEntry {
  price: number;
  qty: number;
}

interface OrderbookTableProps {
  bids: OrderEntry[];
  asks: OrderEntry[];
}

export function OrderbookTable({ bids, asks }: OrderbookTableProps) {
  const displayBids = bids.slice(0, 10);
  const displayAsks = asks.slice(0, 10);

  const paddedBids = [
    ...displayBids,
    ...Array(Math.max(0, 10 - displayBids.length)).fill({ price: 0, qty: 0 }),
  ];
  const paddedAsks = [
    ...displayAsks,
    ...Array(Math.max(0, 10 - displayAsks.length)).fill({ price: 0, qty: 0 }),
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-green-100 px-4 py-2 border-b border-gray-300">
            <h3 className="text-sm font-semibold text-green-800">Bids</h3>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paddedBids.map((bid, index) => (
                  <tr key={index} className="h-8 hover:bg-green-50">
                    <td className="px-4 py-1 text-sm font-mono text-green-700">
                      {bid.price > 0 ? bid.price.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-1 text-sm font-mono text-green-600 text-right">
                      {bid.qty > 0 ? bid.qty.toFixed(4) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-red-100 px-4 py-2 border-b border-gray-300">
            <h3 className="text-sm font-semibold text-red-800">Asks</h3>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paddedAsks.map((ask, index) => (
                  <tr key={index} className="h-8 hover:bg-red-50">
                    <td className="px-4 py-1 text-sm font-mono text-red-700">
                      {ask.price > 0 ? ask.price.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-1 text-sm font-mono text-red-600 text-right">
                      {ask.qty > 0 ? ask.qty.toFixed(4) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
