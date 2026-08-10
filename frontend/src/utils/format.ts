export function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function formatPercent(value: number) {
  return `${Number(value).toFixed(1)}%`
}
