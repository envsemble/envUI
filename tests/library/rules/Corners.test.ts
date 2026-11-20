import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { declarations } from '../../support/StyleSheets.ts';
import {
  repositoryPath,
  repositoryRoot,
  styleSheetsDirectory,
} from '../../../scripts/RepositoryPaths.ts';

function styleSheets() {
  const sheets: { file: string; css: string }[] = [];
  for (const directory of [repositoryPath(styleSheetsDirectory), 'apps/site/src'])
    for (const name of readdirSync(join(repositoryRoot, directory), {
      recursive: true,
      encoding: 'utf8',
    }))
      if (name.endsWith('.css'))
        sheets.push({
          file: `${directory}/${name.replaceAll('\\', '/')}`,
          css: readFileSync(join(repositoryRoot, directory, name), 'utf8'),
        });
  return sheets;
}

const unbounded = /(?:^|[\s(,])(?:\d*\.?\d+%|\d{4,}px|\d+(?:\.\d+)?vmax)/;

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
  'packages/ui/src/styles/Switch.css .env-switch-input::before',
]);

test('round corners are capped, except on parts that are always square, each still listed for a round corner', () => {
  const problems: string[] = [];
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
  assert.deepEqual(
    [...alwaysSquare].filter((key) => !used.has(key)),
    [],
  );
});

test('the full corner is capped at half the tallest single-line control', () => {
  const css = readFileSync(join(styleSheetsDirectory, 'TokensHandwritten.css'), 'utf8');
  const [, value] = css.match(/--env-radius-full:\s*([^;]+);/) ?? [];
  assert.equal(
    value,
    'calc(max(var(--env-control-height-lg), var(--env-control-height-touch)) / 2)',
  );
});
