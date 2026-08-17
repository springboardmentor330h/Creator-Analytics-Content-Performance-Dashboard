// Number Formatter Utilities (K, M, B) with Tooltip Support

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const val = Number(num);
  const abs = Math.abs(val);
  
  if (abs >= 1_000_000_000) {
    return (val / 1_000_000_000).toFixed(1) + 'B';
  }
  if (abs >= 1_000_000) {
    return (val / 1_000_000).toFixed(1) + 'M';
  }
  if (abs >= 1_000) {
    return (val / 1_000).toFixed(1) + 'K';
  }
  return val.toLocaleString();
}

export function rawNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString();
}
