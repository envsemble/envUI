import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// What envUI costs a page to load, held to a budget. It measures packages/ui/dist as the library
// build left it (node scripts/test/MeasureSize.ts --no-build, a few seconds), the way work-0028's
// baselines and targets were measured. Sizes are bytes; gzip at level 9.
//
// Each budget is the size measured when it was set (2026-10-29) plus about 3 %, rounded, so noise
// passes and real growth fails. Raising one is a deliberate decision: say in the commit what grew,
// why it is worth the bytes, and the new measurement. Lower a budget when a size drops for good.

const repository = fileURLToPath(new URL('../', import.meta.url));

/** The CSS a page loads with the bundle set's components, minified, gzip. */
const cssBudgets = {
  // 15,091 measured (2026-11-08, prerelease.6's states, focus rings and motion; was 13,119);
  // raising it is a deliberate decision, recorded in the commit.
  'Small app (Theme, Button, TextField, Card)': 15550,
  // 30,907 measured (2026-11-08, prerelease.6; was 26,080); raising it is a deliberate decision,
  // recorded in the commit.
  'Typical app (23 components, with Base UI)': 31850,
  // 53,065 measured (2026-11-08, prerelease.6; was 45,854); raising it is a deliberate decision,
  // recorded in the commit.
  'Everything, envUI’s own code': 54650,
};

/** The JavaScript a page loads first. */
const jsBudgets = [
  // 34,013 measured (2026-11-08, Table's column resize handle on the shared useResize; was 32,296);
  // raising it is a deliberate decision, recorded in the commit.
  { set: 'Typical app, envUI’s own code', measure: 'gzip', budget: 35050 },
  // 4,701 measured; raising it is a deliberate decision, recorded in the commit.
  { set: 'Theme + Button + Icon', measure: 'minified', budget: 4850 },
];

/** Each component's own envUI code, minified, its Base UI and Floating UI left out. */
const componentBudgets = {
  // 12,294 measured; raising it is a deliberate decision, recorded in the commit.
  Tooltip: 12700,
  // 7,164 measured; raising it is a deliberate decision, recorded in the commit.
  Popover: 7400,
  // 14,607 measured; raising it is a deliberate decision, recorded in the commit.
  Menu: 15000,
  // 15,542 measured; raising it is a deliberate decision, recorded in the commit.
  Select: 16200,
  // 7,528 measured (2026-11-08, prerelease.6's ghost fill and read-only look; was 7,202); raising it
  // is a deliberate decision, recorded in the commit.
  TextField: 7750,
  // 11,200 measured; raising it is a deliberate decision, recorded in the commit.
  Alert: 11500,
};

const report = JSON.parse(
  execFileSync(process.execPath, [join(repository, 'scripts/test/MeasureSize.ts'), '--no-build'], {
    cwd: repository,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  }),
);

const within = (what, size, budget) =>
  assert.ok(
    size <= budget,
    `${what} is ${size} bytes, over its budget of ${budget}. Shrink it, or raise the budget in ` +
      'tests/SizeBudgets.test.mjs as a deliberate decision, recorded in the commit.',
  );

test('the CSS each bundle set loads stays within its budget', () => {
  for (const [set, budget] of Object.entries(cssBudgets))
    within(`${set}: CSS (gzip)`, report.bundles[set].css.gzip, budget);
});

test('the JavaScript a page loads first stays within its budget', () => {
  for (const { set, measure, budget } of jsBudgets)
    within(`${set}: JS (${measure})`, report.bundles[set][measure], budget);
});

test('each component’s own envUI code stays within its budget', () => {
  for (const [name, budget] of Object.entries(componentBudgets))
    within(`${name}: envUI’s own code (minified)`, report.components[name].parts.envUI, budget);
});
