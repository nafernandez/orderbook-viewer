import { getExchangeInfo } from '@/lib/binance';

export default async function Home() {
  const exchangeInfo = await getExchangeInfo();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center space-y-2">
        <p className="text-zinc-600 dark:text-zinc-400">
          Orderbook data
        </p>
        <p className="text-sm text-zinc-500">
          Exchange timezone: {exchangeInfo.timezone}
        </p>
        <p className="text-sm text-zinc-500">
          Symbols loaded: {exchangeInfo.symbols.length}
        </p>
      </div>
    </main>
  );
}