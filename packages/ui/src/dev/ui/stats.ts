export interface WorkStats {
  count: number;
  totalMs: number;
  lastMs: number;
}

const noWorkYet = () => ({ count: 0, totalMs: 0, lastMs: 0 });

export const devStats = {
  geometry: noWorkYet(),
  reading: noWorkYet(),
  copies: noWorkYet(),
  viewRenders: 0,
};

export function countViewRender() {
  devStats.viewRenders += 1;
}

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
