// What dev mode's own work costs, for its debug panel: how often it measures the page, reads it
// for the inspector, copies the planes' surfaces and renders the 3D view, and how long each took.
// Counting is a few additions; the panel reads the counts while it is open.

/** One kind of work: how many times it ran, the time it took in all, and the last time. */
export interface WorkStats {
  count: number;
  totalMs: number;
  lastMs: number;
}

const work = () => ({ count: 0, totalMs: 0, lastMs: 0 });

/** Dev mode's work since it opened. */
export const devStats = {
  /** The geometry, measured at most once an animation frame while the page changes. */
  geometry: work(),
  /** The full measurement and its readout, once the page settles. */
  reading: work(),
  /** Copies of the planes' surfaces, each a node's. */
  copies: work(),
  /** Renders of the 3D view. */
  viewRenders: 0,
};

/** Runs work of a kind, timing it into the stats, and returns what it returns. */
export function timed<T>(stats: WorkStats, run: () => T): T {
  const start = performance.now();
  try {
    return run();
  } finally {
    stats.lastMs = performance.now() - start;
    stats.totalMs += stats.lastMs;
    stats.count += 1;
  }
}
