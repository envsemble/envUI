// The median the measuring scripts report, MeasureRuntime.ts's and MeasureSite.ts's, and the time
// the component tests' shards count for a file they have no record of (ComponentShards.ts).

/** The median of the finite values, or NaN when there are none. */
export function median(values: number[]) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
