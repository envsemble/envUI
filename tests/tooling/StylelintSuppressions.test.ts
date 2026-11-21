import assert from 'node:assert/strict';
import { glob, readFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { test } from 'node:test';
import stylelint from 'stylelint';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { styleSheets } from '../../scripts/test/StaticChecks.ts';

const suppressionsFile = 'stylelint-suppressions.json';
const recordAgain = `Record the lower counts with \`npm run lint:css -- --suppress\` while \`npm run lint:css\` passes, and commit ${suppressionsFile}.`;

type Counts = Record<string, Record<string, { count: number }>>;
type FoundWarning = stylelint.Warning & { file: string };

let linted: Promise<FoundWarning[]> | undefined;
async function warnings() {
  linted ??= lintAll();
  return linted;
}
async function lintAll() {
  const found: FoundWarning[] = [];
  const files = new Set<string>();
  for (const pattern of styleSheets)
    for await (const file of glob(pattern, { cwd: repositoryRoot }))
      files.add(file.split(sep).join('/'));
  for (const file of [...files].sort()) {
    const { results } = await stylelint.lint({
      code: await readFile(join(repositoryRoot, file), 'utf8'),
      codeFilename: join(repositoryRoot, file),
      configFile: join(repositoryRoot, 'stylelint.config.mjs'),
    });
    for (const warning of results.flatMap((result) => result.warnings))
      found.push({ file, ...warning });
  }
  return found;
}

async function violations() {
  const counts: Counts = {};
  for (const { file, rule } of await warnings()) {
    const rules = (counts[file] ??= {});
    (rules[rule] ??= { count: 0 }).count++;
  }
  return counts;
}

function compareCounts(actual: Counts, recorded: Counts) {
  const rises: string[] = [];
  const drops: string[] = [];
  for (const file of new Set([...Object.keys(actual), ...Object.keys(recorded)])) {
    const rules = new Set([
      ...Object.keys(actual[file] ?? {}),
      ...Object.keys(recorded[file] ?? {}),
    ]);
    for (const rule of [...rules].sort()) {
      const found = actual[file]?.[rule]?.count ?? 0;
      const listed = recorded[file]?.[rule]?.count ?? 0;
      const line = `  ${file} ${rule}: found ${found}, recorded ${listed}`;
      if (found > listed) rises.push(line);
      if (found < listed) drops.push(line);
    }
  }
  return { rises: rises.sort(), drops: drops.sort() };
}

test('stylelint-suppressions.json records exactly the CSS violations there are', async () => {
  const recorded = JSON.parse(await readFile(join(repositoryRoot, suppressionsFile), 'utf8'));
  const { rises, drops } = compareCounts(await violations(), recorded);
  const report: string[] = [];
  if (rises.length)
    report.push(
      `New Stylelint violations; fix them, as ${suppressionsFile} only shrinks:`,
      ...rises,
    );
  if (drops.length)
    report.push(
      `Fewer Stylelint violations than ${suppressionsFile} records. ${recordAgain}`,
      ...drops,
    );
  assert.deepEqual(report, [], report.join('\n'));
});

test("no style sheet sets a literal z-index, even where its file's suppressed count allows one", async () => {
  const literal = (await warnings())
    .filter(
      ({ rule, text }) =>
        rule === 'declaration-property-value-allowed-list' && /"z-index"/.test(text),
    )
    .map(({ file, line, text }) => `  ${file}:${line} ${text}`);
  assert.deepEqual(
    literal,
    [],
    ['Take z-index from a stacking token, such as var(--env-z-popup):', ...literal].join('\n'),
  );
});

test('the comparison reports rising and falling counts', () => {
  const recorded = { 'a.css': { 'color-no-hex': { count: 2 }, 'color-named': { count: 1 } } };
  const actual = {
    'a.css': { 'color-no-hex': { count: 3 } },
    'b.css': { 'unit-disallowed-list': { count: 1 } },
  };
  assert.deepEqual(compareCounts(actual, recorded), {
    rises: [
      '  a.css color-no-hex: found 3, recorded 2',
      '  b.css unit-disallowed-list: found 1, recorded 0',
    ],
    drops: ['  a.css color-named: found 0, recorded 1'],
  });
  assert.deepEqual(compareCounts(recorded, recorded), { rises: [], drops: [] });
});
