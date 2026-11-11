import assert from 'node:assert/strict';
import { glob, readFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { test } from 'node:test';
import stylelint from 'stylelint';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { styleSheets } from '../../scripts/test/Checks.ts';

// stylelint-suppressions.json records the violations that predate the style rules, per file and
// rule. Stylelint fails only when a count rises, so a recorded count above the real one would leave
// room for new violations. This test lints without the suppressions and requires the recorded
// counts to equal the real ones.

const suppressionsFile = 'stylelint-suppressions.json';
const recordAgain = `Record the lower counts with \`npm run lint:css -- --suppress\` while \`npm run lint:css\` passes, and commit ${suppressionsFile}.`;

/** Every warning of the linted style sheets without the suppressions, with its file. */
let linted;
async function warnings() {
  linted ??= lintAll();
  return linted;
}
async function lintAll() {
  const found = [];
  const files = new Set();
  for (const pattern of styleSheets)
    for await (const file of glob(pattern, { cwd: repositoryRoot }))
      files.add(file.split(sep).join('/'));
  for (const file of [...files].sort()) {
    // Linting the code rather than the file leaves the suppressions file out.
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

/** Violations per file and rule, as stylelint-suppressions.json records them. */
async function violations() {
  const counts = {};
  for (const { file, rule } of await warnings()) {
    counts[file] ??= {};
    counts[file][rule] ??= { count: 0 };
    counts[file][rule].count++;
  }
  return counts;
}

/** Lines for the counts that differ, rises and drops apart. */
function compareCounts(actual, recorded) {
  const rises = [];
  const drops = [];
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
  const report = [];
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

// The stacking order comes from the --env-z-* tokens everywhere, so no suppression may hide a
// literal z-index: a new one fails here even where the file's count of the rule would allow it.
test('no style sheet sets a literal z-index', async () => {
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
