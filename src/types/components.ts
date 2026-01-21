export interface AssetSelectorProps {
  onChange: (symbol: string) => void;
}

export interface SymbolInfo {
  symbol: string;
  displayName: string;
}

export interface OrderbookTableProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spreadData: SpreadData | null;
  symbol: string | null;
}

export interface OrderLevel {
  price: number;
  qty: number;
  total: number;
}

export interface SpreadData {
  spread: number;
  spreadPercent: number;
  midPrice: number;
}
