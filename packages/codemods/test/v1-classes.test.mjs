import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadMap, renameClass } from '../src/map.mjs';
import * as v1Classes from '../src/transforms/v1-classes.mjs';
import { renameInStyles } from '../src/transforms/v1-classes.mjs';
import { applyTransform, encodings, fixtures, map, runTransform } from './helpers.mjs';

const { classes } = loadMap();
const entries = Object.entries(map.classes).filter(([from]) => !from.startsWith('$'));

for (const fixture of fixtures('v1-classes')) {
  test(`v1-classes: ${fixture.name}`, () => {
    const result = runTransform(v1Classes, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, fixture.reports);
  });

  test(`v1-classes is idempotent: ${fixture.name}`, () => {
    assert.equal(runTransform(v1Classes, fixture.path, fixture.output).output, fixture.output);
  });

  test(`v1-classes through jscodeshift's applyTransform: ${fixture.name}`, () => {
    const output = applyTransform(v1Classes, {}, { path: fixture.path, source: fixture.input });
    assert.equal(output || fixture.input.trim(), fixture.output.trim());
  });

  // Files saved on Windows: CRLF line endings, a byte order mark, or both.
  for (const [variant, encode] of encodings)
    test(`v1-classes with ${variant}: ${fixture.name}`, () => {
      const result = runTransform(v1Classes, fixture.path, encode(fixture.input));
      assert.equal(result.output, encode(fixture.output));
    });
}

test('renameClass renames an entry and the names that continue it with a hyphen', () => {
  assert.equal(renameClass('env-notice', classes), 'env-alert');
  assert.equal(renameClass('env-notice-title', classes), 'env-alert-title');
  assert.equal(renameClass('env-notice-', classes), 'env-alert-');
  assert.equal(renameClass('env-notices', classes), 'env-notices');
  assert.equal(renameClass('env-notice_title', classes), 'env-notice_title');
  assert.equal(renameClass('env-alert', classes), 'env-alert');
});

test('renameClass prefers the longest entry', () => {
  assert.equal(renameClass('env-date-time-field', classes), 'env-date-picker');
  assert.equal(renameClass('env-date-time-field-icon', classes), 'env-date-picker-icon');
  assert.equal(renameClass('env-date-time-well', classes), 'env-date-picker-control');
  assert.equal(renameClass('env-navigation-item', classes), 'env-nav-list-item');
  assert.equal(renameClass('env-navigation-dot', classes), 'env-nav-list-item-dot');
  assert.equal(renameClass('env-direction-links', classes), 'env-pager');
  assert.equal(renameClass('env-direction-link-label', classes), 'env-pager-link-label');
});

test('renameClass leaves names that already continue the new name', () => {
  assert.equal(renameClass('env-counter', classes), 'env-counter-badge');
  assert.equal(renameClass('env-counter-label', classes), 'env-counter-badge-label');
  assert.equal(renameClass('env-counter-badge', classes), 'env-counter-badge');
  assert.equal(renameClass('env-counter-badge-label', classes), 'env-counter-badge-label');
});

test('v1-classes renames every class entry in style sheets and class names', () => {
  for (const [from, to] of entries) {
    const css = `.${from}, .${from}-part, [class~='${from}'] { --${from}-part: var(--${from}); }\n`;
    assert.equal(
      runTransform(v1Classes, 'styles.css', css).output,
      `.${to}, .${to}-part, [class~='${to}'] { --${to}-part: var(--${to}); }\n`,
      from,
    );
    const tsx = `export const element = <div className="${from} ${from}-part" />;\n`;
    assert.equal(
      runTransform(v1Classes, 'element.tsx', tsx).output,
      `export const element = <div className="${to} ${to}-part" />;\n`,
      from,
    );
  }
});

test('v1-classes reads every style sheet syntax and leaves other files alone', () => {
  for (const extension of ['css', 'scss', 'sass', 'less', 'pcss'])
    assert.equal(
      runTransform(v1Classes, `styles.${extension}`, '.env-row {}\n').output,
      '.env-list-item {}\n',
      extension,
    );
  assert.equal(runTransform(v1Classes, 'notes.tsx', 'export const notes = 1;\n').skipped, true);
});

test('v1-classes reads another map through the map option', () => {
  const directory = mkdtempSync(join(tmpdir(), 'envui-codemods-map-'));
  try {
    const path = join(directory, 'map.json');
    writeFileSync(path, JSON.stringify({ classes: { 'env-notice': 'env-alert' } }));
    assert.equal(
      runTransform(v1Classes, 'styles.css', '.env-notice, .env-row {}\n', { map: path }).output,
      '.env-alert, .env-row {}\n',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('v1-classes reports the tokens 1.0 removes and the fixed colors, and leaves them', () => {
  const css = '.a {\n  color: var(--color-white);\n  inline-size: calc(var(--scale) * 2rem);\n}\n';
  const result = runTransform(v1Classes, 'styles.css', css);
  assert.equal(result.output, css);
  assert.equal(result.reports.length, 2);
  assert.match(
    result.reports[0],
    /^line 2: --color-white is removed in 1\.0 and no token replaces it: write its color, #ffffff/,
  );
  assert.match(result.reports[1], /^line 3: --scale is removed in 1\.0: The multiplier is gone/);
  const tsx =
    "export const a = (\n  <div\n    style={{ width: 'calc(var(--scale) * 1rem)' }}\n  />\n);\n";
  const script = runTransform(v1Classes, 'a.tsx', tsx);
  assert.equal(script.output, tsx);
  assert.deepEqual(
    script.reports.map((report) => report.split(':')[0]),
    ['line 3'],
  );
});

test("v1-classes renames the custom properties of 1.0's development in style sheets and scripts", () => {
  const css = `.a {
  inset-block-start: var(--env-app-sticky-top);
  block-size: var(--env-topbar-height);
}
`;
  assert.equal(
    runTransform(v1Classes, 'styles.css', css).output,
    `.a {
  inset-block-start: var(--env-frame-sticky-top);
  block-size: var(--env-app-shell-header-height);
}
`,
  );
  const tsx = `const top = getComputedStyle(root).getPropertyValue('--env-app-topbar-block-size');
export const a = <div style={{ '--env-app-topbar-block-size': '4rem', top: 'var(--env-app-sticky-top)' }} />;
`;
  assert.equal(
    runTransform(v1Classes, 'a.tsx', tsx).output,
    `const top = getComputedStyle(root).getPropertyValue('--env-frame-header-block-size');
export const a = <div style={{ '--env-frame-header-block-size': '4rem', top: 'var(--env-frame-sticky-top)' }} />;
`,
  );
});

test('v1-classes renames every token entry, and no class entry renames a 1.0 token', () => {
  const tokens = Object.entries(map.tokens).filter(([from]) => !from.startsWith('$'));
  assert.ok(tokens.length > 300);
  const sources = Map.groupBy(
    tokens.filter(([, entry]) => entry.to && !entry.removed),
    ([, entry]) => entry.to,
  );
  for (const [from, entry] of tokens) {
    if (!entry.to || entry.removed) continue;
    // A declaration is rewritten where the name is the only one that becomes the token, or the
    // token's own name; any other is reported, and only its uses are renamed.
    const declared =
      sources.get(entry.to).length === 1 || entry.to === `--env-${from.slice(2)}` ? entry.to : from;
    const css = `.a { ${from}: 1; margin: var(${from}); }\n`;
    const result = runTransform(v1Classes, 'styles.css', css);
    assert.equal(result.output, `.a { ${declared}: 1; margin: var(${entry.to}); }\n`, from);
    assert.equal(result.reports.length, declared === from ? 1 : 0, from);
  }
  const { tokenNames } = loadMap();
  for (const name of tokenNames)
    assert.equal(renameInStyles(`--${name}`, classes, [], new Map(), tokenNames), `--${name}`);
});

test('v1-classes reports modifier classes in markup, which props set in 1.0', () => {
  const source = [
    "import { Button } from '@envsemble/envui';",
    'export const A = () => <a className="env-button env-button-important">Go</a>;',
    "document.querySelector('.env-button-quiet');",
    '',
  ].join('\n');
  const result = runTransform(v1Classes, 'a.tsx', source);
  assert.equal(
    result.output,
    source.replace("'.env-button-quiet'", "'.env-button:where([data-variant=ghost])'"),
  );
  assert.deepEqual(result.reports, [
    "line 2: env-button-important is gone in 1.0: .env-button carries [data-variant='primary'][data-tone='accent'] instead, which the component's props set.",
  ]);
});

test('v1-classes tells a test file by its path below the folder it was found in', () => {
  const { isTestFile } = v1Classes;
  const work = join(tmpdir(), 'tests', 'app');
  // Folders above the scanned one, such as a checkout kept in a `tests` folder, don't count.
  assert.equal(isTestFile(join(work, 'src', 'menu.tsx'), [work]), false);
  assert.equal(isTestFile(join(work, 'e2e', 'menu.ts'), [work]), true);
  assert.equal(isTestFile(join(work, 'src', 'menu.test.tsx'), [work]), true);
  // The deepest scanned folder that holds the file decides.
  assert.equal(isTestFile(join(work, 'src', 'menu.tsx'), [tmpdir(), work]), false);
  // Without scanned folders, the path below the nearest package.json counts.
  const project = mkdtempSync(join(tmpdir(), 'envui-codemods-tests-'));
  try {
    mkdirSync(join(project, 'tests', 'app', 'src'), { recursive: true });
    writeFileSync(join(project, 'tests', 'app', 'package.json'), '{}');
    assert.equal(isTestFile(join(project, 'tests', 'app', 'src', 'menu.tsx')), false);
    assert.equal(isTestFile(join(project, 'tests', 'app', 'tests', 'menu.ts')), true);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});
