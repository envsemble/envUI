import { readFileSync, writeFileSync } from 'node:fs';
import { componentDurationsFile, repositoryPath } from '../RepositoryPaths.ts';

const [report] = process.argv.slice(2);
if (!report) throw new Error('Usage: RecordDurations.ts <Vitest JSON report>');

interface Report {
  testResults: { name: string; startTime: number; endTime: number }[];
}
const { testResults } = JSON.parse(readFileSync(report, 'utf8')) as Report;
const files: Record<string, number> = {};
for (const { name, startTime, endTime } of testResults) {
  const path = repositoryPath(name);
  files[path] = Math.max(files[path] ?? 0, Math.round((endTime - startTime) / 100) / 10);
}
const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)));
writeFileSync(
  componentDurationsFile,
  `${JSON.stringify(
    {
      $comment:
        'Seconds each component test file takes on two workers. Refresh: npm run test:record-durations -- <Vitest JSON report>.',
      files: sorted,
    },
    null,
    2,
  )}\n`,
);
console.log(
  `${Object.keys(sorted).length} files recorded in ${repositoryPath(componentDurationsFile)}`,
);
