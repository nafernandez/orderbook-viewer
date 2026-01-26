import type { DepthResponse, DepthUpdateEvent, OrderLevel } from '@/types';

export type OrderBookApplyResult = 'applied' | 'stale' | 'gap';

export class OrderBookEngine {
  private bids = new Map<number, number>();
  private asks = new Map<number, number>();
  private lastUpdateId = 0;

  reset() {
    this.bids.clear();
    this.asks.clear();
    this.lastUpdateId = 0;
  }

  getLastUpdateId() {
    return this.lastUpdateId;
  }

  applySnapshot(snapshot: DepthResponse) {
    this.reset();
    snapshot.bids.forEach(([price, qty]) => {
      this.bids.set(parseFloat(price), parseFloat(qty));
    });
    snapshot.asks.forEach(([price, qty]) => {
      this.asks.set(parseFloat(price), parseFloat(qty));
    });
    this.lastUpdateId = snapshot.lastUpdateId;
  }

  applyDiff(update: DepthUpdateEvent): OrderBookApplyResult {
    if (this.lastUpdateId === 0) {
      return 'gap';
    }

    if (typeof update.pu === 'number' && update.pu !== this.lastUpdateId) {
      return 'gap';
    }

    if (update.u <= this.lastUpdateId) {
      return 'stale';
    }

    if (update.U > this.lastUpdateId + 1) {
      return 'gap';
    }

    if (update.U <= this.lastUpdateId + 1 && update.u >= this.lastUpdateId + 1) {
      this.applyLevels(update.b, this.bids);
      this.applyLevels(update.a, this.asks);
      this.lastUpdateId = update.u;
      return 'applied';
    }

    return 'stale';
  }

  getTopLevels(limit: number) {
    return {
      bids: this.buildLevels(this.bids, 'desc', limit),
      asks: this.buildLevels(this.asks, 'asc', limit),
    };
  }

  private applyLevels(levels: [string, string][], book: Map<number, number>) {
    levels.forEach(([price, qty]) => {
      const priceNum = parseFloat(price);
      const qtyNum = parseFloat(qty);

      if (qtyNum === 0) {
        book.delete(priceNum);
        return;
      }

      book.set(priceNum, qtyNum);
    });
  }

  private buildLevels(
    book: Map<number, number>,
    direction: 'asc' | 'desc',
    limit: number
  ): OrderLevel[] {
    const sorted = Array.from(book.entries()).sort((a, b) =>
      direction === 'asc' ? a[0] - b[0] : b[0] - a[0]
    );

    const slice = sorted.slice(0, limit);
    let depth = 0;

    return slice.map(([price, qty]) => {
      const total = price * qty;
      depth += total;
      return {
        price,
        qty,
        total,
        depth,
      };
    });
  }
}
