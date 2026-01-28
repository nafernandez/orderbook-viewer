# Orderbook Viewer

Orderbook Viewer is a small Next.js (App Router) app that shows the live Binance order book. It loads a REST snapshot, listens to the `@depth` WebSocket stream, and keeps bids/asks in sync so you can watch price levels update in real time.

## What is included
- Full UI with asset selector, bids/asks table, spread bar, skeleton loaders, and error toast.
- Pure engine `src/orderbook/OrderBookEngine.ts` that applies snapshot diffs, keeps sequence numbers in order, and returns the top levels ready to render.
- Hook `useOrderbook` with buffering, resync flow, retry counter, and a `restartToken` that forces a new WebSocket when needed.
- REST + WebSocket helpers inside `src/services/`, plus small number-format helpers.
- Vitest suite with unit tests for the engine and for the hook using a mocked WebSocket.

## How to run

### Local
```bash
npm install
npm run dev
```

### Docker
```bash
docker build -t orderbook-challenge .
docker run -p 3000:3000 orderbook-challenge
```

### Or check it directly online
https://orderbook-viewer-psi.vercel.app/ 

## Design decisions
1. **Engine outside React**. Moving the book logic into `OrderBookEngine` lets me test `applySnapshot`, `applyDiff`, and `getTopLevels` without React state noise. The engine only stores `Map<number, number>` so React gets clean arrays.
2. **Buffer before snapshot**. In `useOrderbook` I store incoming diffs until the REST snapshot resolves, then I replay them in order. This avoids race conditions between REST and WS without adding extra libraries. This decision was made based on the [recommended way shared by Binance](https://www.binance.com/en/academy/articles/local-order-book-tutorial-part-1-depth-stream-and-event-buffering).
3. **Keep most logic inside one hook**. The callbacks share the same refs (`isInitializedRef`, `eventBufferRef`, `connectionRestartToken`, etc.). Splitting them into many files would pass lots of props around and make the story harder to read. I prefer one cohesive hook (~180 lines) for this case.
4. **Simple reconnects**. `useWebSocket` grows the delay linearly (`delay = reconnectInterval * attempt`). It is enough for this project and keeps the code easy to follow.
5. **Lightweight UI state**. The hook exposes `isLoading` and `error`. The engine also tracks resync flags and retry count, so we can display banners or telemetry later.
6. **WebSocket interval set to 1000 ms**. Binance lets us subscribe with 100 ms or 1000 ms updates. I picked 1000 ms because this app is a viewer aimed at humans; a flood of 100 ms updates would be noisy and hard to read, while 1 update per second still feels “live” without overwhelming the table.


## Known trade-offs
- **Configurable numeric precision (not done)**. Everything still uses `Number/parseFloat`. I know that pairs with many decimals can show rounding errors. The plan would be to add something more accurate in the future, like Decimal.js.
- **Re-render on every delta**. Each WebSocket message calls `updateVisualState` in `useOrderbook.ts`, which sorts levels and triggers `setState`. Because I subscribe at 1000 ms, this means one render per second, which is acceptable for a viewer. If I ever switch to 100 ms updates, I would need throttling or an external store to avoid repaint storms.
- **Logic concentrated in `useOrderbook`**. Extracting every callback to its own file would force me to pass all refs around and jump between modules. Right now the file is long but linear, so it is easier to follow the flow. Only pure utilities (engine, formatters, services) live outside.

## What I would improve in the future
1. Add `parsePrice`, `parseQty`, `formatTotal` and let the engine switch between floats, scaled integers, or Decimal.js through one config flag.
2. Put a small rhythm on diffs: gather messages in a tiny buffer before updating React so the table does not try to repaint 100 times per second with a smaller update interval.
3. Make the WebSocket reconnect smarter: each attempt waits a bit longer, adds a touch of randomness so clients avoid clashing, and cancels the wait when the user leaves.

## Tests
- `npm test` (Vitest) — 2 files and 8 tests pass. Coverage includes `tests/orderbook/OrderBookEngine.test.ts` and `tests/hooks/useOrderbook.test.tsx` with cases for buffering, gaps/resync, and snapshot errors.
