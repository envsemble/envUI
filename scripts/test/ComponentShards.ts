// How CI splits the component test files into shards: by the time each takes, as
// tests/component/Durations.json records it (scripts/test/RecordDurations.ts writes it), rather
// than by their count. Vitest's sequencer applies it (tests/component/ShardByDuration.ts).
import { readFileSync } from 'node:fs';
import { componentDurationsFile } from '../RepositoryPaths.ts';
import { median } from '../measure/Median.ts';

/**
 * The first shard also builds the library and runs its hydration specs (TestBrowser.ts): about a
 * tenth of what the files take on CI's runners, so it starts with that much.
 */
const firstShardShare = 0.1;

/** The seconds each file takes, by its path from the repository's root. */
export function readDurations(): Record<string, number> {
  return JSON.parse(readFileSync(componentDurationsFile, 'utf8')).files;
}

/**
 * The files of each of `count` shards: longest first, each goes to the shard with the least time
 * so far. A file the record doesn't have counts as its median. Every shard works the split out
 * alike, from the committed record.
 */
export function shardsOf(paths: string[], durations: Record<string, number>, count: number) {
  const typical = median(Object.values(durations));
  const seconds = (path: string) => durations[path] ?? typical;
  const files = [...new Set(paths)];
  const whole = files.reduce((sum, path) => sum + seconds(path), 0);
  const loads = Array.from({ length: count }, (_, index) => (index ? 0 : whole * firstShardShare));
  const shards: string[][] = Array.from({ length: count }, () => []);
  files.sort((a, b) => seconds(b) - seconds(a) || (a < b ? -1 : 1));
  for (const path of files) {
    const lightest = loads.indexOf(Math.min(...loads));
    shards[lightest]!.push(path);
    loads[lightest]! += seconds(path);
  }
  return shards;
}
