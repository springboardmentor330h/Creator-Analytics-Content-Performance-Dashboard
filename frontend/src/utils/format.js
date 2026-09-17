// Formats large numbers compactly for chart axis labels (e.g. 1400000 -> "1.4M"),
// so labels stay narrow enough to never get clipped by the chart container.
export function formatCompactNumber(value) {
  if (value === null || value === undefined) return "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(value);
}
