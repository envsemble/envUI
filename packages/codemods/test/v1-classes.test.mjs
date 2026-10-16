import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadMap, renameClass } from '../src/map.mjs';
import * as v1Classes from '../src/transforms/v1-classes.mjs';
import { applyTransform, fixtures, map, runTransform } from './helpers.mjs';

const { classes } = loadMap();
const entries = Object.entries(map.classes).filter(([from]) => !from.startsWith('$'));

for (const fixture of fixtures('v1-classes')) {
  test(`v1-classes: ${fixture.name}`, () => {
    const result = runTransform(v1Classes, fixture.path, fixture.input);
    assert.equal(result.output, fixture.output);
    assert.deepEqual(result.reports, []);
  });

  test(`v1-classes is idempotent: ${fixture.name}`, () => {
    assert.equal(runTransform(v1Classes, fixture.path, fixture.output).output, fixture.output);
  });

  test(`v1-classes through jscodeshift's applyTransform: ${fixture.name}`, () => {
    const output = applyTransform(v1Classes, {}, { path: fixture.path, source: fixture.input });
    assert.equal(output || fixture.input.trim(), fixture.output.trim());
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
  assert.equal(renameClass('env-date-time-well', classes), 'env-date-picker-well');
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
    const css = `.${from}, .${from}-part, [class~='${from}'] { --${from}-size: var(--${from}); }\n`;
    assert.equal(
      runTransform(v1Classes, 'styles.css', css).output,
      `.${to}, .${to}-part, [class~='${to}'] { --${to}-size: var(--${to}); }\n`,
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
