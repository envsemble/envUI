import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

// What envUI costs a page to load, held to a budget. It measures packages/ui/dist as the library
// build left it (node scripts/measure/MeasureSize.ts --no-build, a few seconds), the way work-0028's
// baselines and targets were measured. Sizes are bytes; gzip at level 9.
//
// Each budget is the size measured when it was last set (2026-11-09, unless its comment says
// otherwise) plus about 1.5 %, rounded up to 50, so noise passes and real growth fails. Raising one
// is a deliberate decision: say in the commit what grew, why it is worth the bytes, and the new
// measurement. Lower a budget when a size drops for good.

/** The whole style sheet, styles.css, minified, gzip: 57,334 measured. */
const stylesheetBudget = 58200;

/** The CSS a page loads with the bundle set's components, minified, gzip. */
const cssBudgets = {
  // 14,868 measured (the text area's resize handle in a style sheet of its own; was 15,104).
  'Small app (Theme, Button, TextField, Card)': 15100,
  // 30,873 measured (also Table's column resize handles in theirs; was 31,248).
  'Typical app (23 components, with Base UI)': 31350,
  // 53,383 measured.
  'Everything, envUI’s own code': 54200,
};

/** The JavaScript a page loads first. */
const jsBudgets = [
  // 31,388 measured: List's reorder, Table's column resizing, Scaffold's body scrolling keys and a
  // contained toast region's notices load only where they are used (was 34,661), with what holds
  // people's input until they have and copes with a failed load. 32,217 since popups give focus
  // back as they start to close (closingFocus.ts, 892 bytes).
  { set: 'Typical app, envUI’s own code', measure: 'gzip', budget: 32650 },
  // 108,029 measured (was 110,015).
  { set: 'Everything, envUI’s own code', measure: 'gzip', budget: 109650 },
  // 4,953 measured on 2026-11-11. Raised from 4,950 (4,888 measured): Theme's and the buttons'
  // development reports go through reportInDevelopment, as every other report does, rather than
  // each writing its own guard, 65 bytes. Raised from 4,850 (4,832 measured on 2026-11-08):
  // esbuild puts the modules the lazily loaded options share with a page, such as flag.js, in
  // chunks of their own even where the page never loads the option, and the page imports them from
  // there, 56 bytes.
  { set: 'Theme + Button + Icon', measure: 'minified', budget: 5050 },
];

/** Each component's own envUI code, minified, its Base UI and Floating UI left out. */
const componentBudgets = {
  // 15,336 measured (2026-11-11): 12,718, closingFocus.ts, which every popup surface brings, and
  // useControllableState.ts with useLatest.ts, the open state every popup shares (was 14,896).
  Tooltip: 15550,
  // 9,935 measured: 7,757, and closingFocus.ts.
  Popover: 10100,
  // 17,610 measured: 15,184, and closingFocus.ts with the submenu's guard.
  Menu: 17850,
  // 18,815 measured: 16,470, and closingFocus.ts.
  Select: 19100,
  // 7,524 measured.
  TextField: 7650,
  // 11,279 measured.
  Alert: 11450,
};

const report = JSON.parse(
  execFileSync(
    process.execPath,
    [join(repositoryRoot, 'scripts/measure/MeasureSize.ts'), '--no-build'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  ),
);

const within = (what: string, size: number, budget: number) =>
  assert.ok(
    size <= budget,
    `${what} is ${size} bytes, over its budget of ${budget}. Shrink it, or raise the budget in ` +
      'tests/library/package/SizeBudgets.test.ts as a deliberate decision, recorded in the commit.',
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
