import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const stylesheetGzipBudget = 59250;

const cssGzipBudgets = {
  'Small app (Theme, Button, TextField, Card)': 15400,
  'Typical app (23 components, with Base UI)': 32200,
  'Everything, envUI’s own code': 55850,
};

const firstLoadJsBudgets = [
  { set: 'Typical app, envUI’s own code', measure: 'gzip', budget: 35750 },
  { set: 'Everything, envUI’s own code', measure: 'gzip', budget: 115200 },
  { set: 'Theme + Button + Icon', measure: 'minified', budget: 6050 },
];

const componentOwnCodeMinifiedBudgets = {
  Tooltip: 16400,
  Popover: 10450,
  Menu: 19450,
  Select: 21200,
  TextField: 9200,
  Alert: 11650,
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
  within('styles.css (gzip)', report.stylesheet.gzip, stylesheetGzipBudget));

test('the CSS each bundle set loads stays within its budget', () => {
  for (const [set, budget] of Object.entries(cssGzipBudgets))
    within(`${set}: CSS (gzip)`, report.bundles[set].css.gzip, budget);
});

test('the JavaScript a page loads first stays within its budget', () => {
  for (const { set, measure, budget } of firstLoadJsBudgets)
    within(`${set}: JS (${measure})`, report.bundles[set][measure], budget);
});

test('each component’s own envUI code stays within its budget', () => {
  for (const [name, budget] of Object.entries(componentOwnCodeMinifiedBudgets))
    within(`${name}: envUI’s own code (minified)`, report.components[name].parts.envUI, budget);
});
