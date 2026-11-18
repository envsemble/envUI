import { readFileSync } from 'node:fs';
import { componentDurationsFile } from '../RepositoryPaths.ts';
import { median } from '../measure/Median.ts';

const firstShardShare = 0.1;

export function readDurations(): Record<string, number> {
  return JSON.parse(readFileSync(componentDurationsFile, 'utf8')).files;
}

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
