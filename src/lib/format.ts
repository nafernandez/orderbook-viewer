function trimZeros(value: string): string {
  return value.replace(/\.?0+$/, '');
}

function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—';
  return trimZeros(value.toFixed(decimals));
}

export function formatPrice(value: number): string {
  if (value >= 1000) return formatNumber(value, 2);
  if (value >= 1) return formatNumber(value, 4);
  return formatNumber(value, 6);
}

export function getPriceDecimals(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 1) return 4;
  return 6;
}

export function getQuantityDecimals(): number {
  return 4;
}

export function formatQty(value: number): string {
  if (value >= 1) return formatNumber(value, 4);
  if (value >= 0.01) return formatNumber(value, 5);
  return formatNumber(value, 8);
}