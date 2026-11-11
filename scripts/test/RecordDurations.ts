// Records how long each component test file takes, from a Vitest JSON report, in
// tests/component/Durations.json, by which CI splits the files into shards
// (scripts/test/ComponentShards.ts). Refresh it on two workers, as a CI runner has:
//
//   ENVUI_WORKERS=2 npm run test:component -- --reporter=json --outputFile=.cache/component-report.json
//   node scripts/test/RecordDurations.ts .cache/component-report.json
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { componentDurationsFile, repositoryRoot } from '../RepositoryPaths.ts';

const [report] = process.argv.slice(2);
if (!report) throw new Error('Usage: RecordDurations.ts <Vitest JSON report>');

interface Report {
  testResults: { name: string; startTime: number; endTime: number }[];
}
const { testResults } = JSON.parse(readFileSync(report, 'utf8')) as Report;
const files: Record<string, number> = {};
for (const { name, startTime, endTime } of testResults) {
  const path = relative(repositoryRoot, name).replaceAll(sep, '/');
  // A file run in several projects counts once, at its longest.
  files[path] = Math.max(files[path] ?? 0, Math.round((endTime - startTime) / 100) / 10);
}
const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)));
writeFileSync(
  componentDurationsFile,
  `${JSON.stringify(
    {
      '//': 'Seconds each component test file takes on two workers. Refresh: scripts/test/RecordDurations.ts.',
      files: sorted,
    },
    null,
    2,
  )}\n`,
);
console.log(
  `${Object.keys(sorted).length} files recorded in ${relative(repositoryRoot, componentDurationsFile)}`,
);
