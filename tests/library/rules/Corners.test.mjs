// A tall element never keeps pill corners: the style sheets round an element fully only through the
// capped full corner, --env-radius-full, half the tallest single-line control, so anything that
// grows taller than one line keeps its corners and becomes a rounded rectangle. A round corner of a
// share of the box (50%) or an endless one (9999px, 100vmax) stays only on what is always square,
// listed below.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { declarations } from '../../support/CssDeclarations.mjs';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

/** The style sheets envUI ships, dev mode's and the catalogue's. */
function styleSheets() {
  const sheets = [];
  // The catalogue's sheets sit beside the code they style, in the folders of apps/site/src.
  for (const directory of ['packages/ui/src/styles', 'packages/ui/src/dev/ui', 'apps/site/src'])
    for (const name of readdirSync(join(repositoryRoot, directory), { recursive: true }))
      if (name.endsWith('.css'))
        sheets.push({
          file: `${directory}/${name.replaceAll('\\', '/')}`,
          css: readFileSync(join(repositoryRoot, directory, name), 'utf8'),
        });
  return sheets;
}

/** A radius that rounds a box fully whatever its size: a share of it, or an endless length. */
const unbounded = /(?:^|[\s(,])(?:\d*\.?\d+%|\d{4,}px|\d+(?:\.\d+)?vmax)/;

/**
 * Parts that are always square, so a round corner of half their size draws a circle: avatars, round
 * icon buttons, dots, marks, thumbs and the halo around a checkbox. Each by its style sheet and selector.
 */
const alwaysSquare = new Set([
  'packages/ui/src/styles/Alert.css .env-alert-dismiss',
  'packages/ui/src/styles/Avatar.css .env-avatar',
  'packages/ui/src/styles/Avatar.css .env-avatar-check',
  'packages/ui/src/styles/AvatarGroup.css .env-avatar-group-item',
  'packages/ui/src/styles/AvatarButton.css .env-avatar-button',
  'packages/ui/src/styles/Calendar.css .env-calendar-day-mark',
  'packages/ui/src/styles/Checkbox.css .env-checkbox-box::before',
  'packages/ui/src/styles/ColorPicker.css .env-color-picker-thumb',
  'packages/ui/src/styles/DropZone.css .env-drop-zone-icon',
  'packages/ui/src/styles/PanelDock.css .env-panel-dock-tab-attention',
  'packages/ui/src/styles/Switch.css .env-switch-input::before',
]);

test('round corners are capped, except on parts that are always square', () => {
  const problems = [];
  const used = new Set();
  for (const { file, css } of styleSheets())
    for (const declaration of declarations(css)) {
      if (!/radius$/.test(declaration.prop) || !unbounded.test(declaration.value)) continue;
      const key = `${file} ${declaration.selector}`;
      if (alwaysSquare.has(key)) used.add(key);
      else
        problems.push(
          `${key}: ${declaration.prop}: ${declaration.value}. Use var(--env-radius-full), or list the part here if it is always square.`,
        );
    }
  assert.deepEqual(problems, []);
  // An entry that matches nothing is stale.
  assert.deepEqual(
    [...alwaysSquare].filter((key) => !used.has(key)),
    [],
  );
});

test('the full corner is capped at half the tallest single-line control', () => {
  const css = readFileSync(
    join(repositoryRoot, 'packages/ui/src/styles/TokensHandwritten.css'),
    'utf8',
  );
  const [, value] = css.match(/--env-radius-full:\s*([^;]+);/) ?? [];
  assert.equal(
    value,
    'calc(max(var(--env-control-height-lg), var(--env-control-height-touch)) / 2)',
  );
});
