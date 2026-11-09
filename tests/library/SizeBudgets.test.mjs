import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

// What envUI costs a page to load, held to a budget. It measures packages/ui/dist as the library
// build left it (node scripts/test/MeasureSize.ts --no-build, a few seconds), the way work-0028's
// baselines and targets were measured. Sizes are bytes; gzip at level 9.
//
// Each budget is the size measured when it was last set (2026-11-09, unless its comment says
// otherwise) plus about 1.5 %, rounded up to 50, so noise passes and real growth fails. Raising one
// is a deliberate decision: say in the commit what grew, why it is worth the bytes, and the new
// measurement. Lower a budget when a size drops for good.

/** The whole style sheet, styles.css, minified, gzip: 57,314 measured. */
const stylesheetBudget = 58200;

/** The CSS a page loads with the bundle set's components, minified, gzip. */
const cssBudgets = {
  // 15,104 measured (Text without the hover detail's style sheet; was 15,293).
  'Small app (Theme, Button, TextField, Card)': 15350,
  // 31,248 measured.
  'Typical app (23 components, with Base UI)': 31750,
  // 53,520 measured.
  'Everything, envUI’s own code': 54350,
};

/** The JavaScript a page loads first. */
const jsBudgets = [
  // 34,661 measured.
  { set: 'Typical app, envUI’s own code', measure: 'gzip', budget: 35050 },
  // 110,015 measured.
  { set: 'Everything, envUI’s own code', measure: 'gzip', budget: 111700 },
  // 4,832 measured (2026-11-08).
  { set: 'Theme + Button + Icon', measure: 'minified', budget: 4850 },
];

/** Each component's own envUI code, minified, its Base UI and Floating UI left out. */
const componentBudgets = {
  // 12,589 measured.
  Tooltip: 12700,
  // 7,633 measured.
  Popover: 7750,
  // 15,184 measured.
  Menu: 15450,
  // 16,470 measured.
  Select: 16750,
  // 7,524 measured.
  TextField: 7650,
  // 11,279 measured.
  Alert: 11450,
};

const report = JSON.parse(
  execFileSync(
    process.execPath,
    [join(repositoryRoot, 'scripts/test/MeasureSize.ts'), '--no-build'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  ),
);

const within = (what, size, budget) =>
  assert.ok(
    size <= budget,
    `${what} is ${size} bytes, over its budget of ${budget}. Shrink it, or raise the budget in ` +
      'tests/library/SizeBudgets.test.mjs as a deliberate decision, recorded in the commit.',
  );

test('the whole style sheet stays within its budget', () =>
  within('styles.css (gzip)', report.stylesheet.gzip, stylesheetBudget));

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
