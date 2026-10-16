import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildTokens } from '../../scripts/BuildTokens.mjs';
import { catalogueUrl } from './Servers';

// The test edits the real space.tokens.json, which the catalogue's dev server watches. A run that
// is killed before its `finally` leaves the edit behind; the next run puts the line back first, so
// the edit never reaches a commit or a later baseline.
const tokens = resolve('packages/ui/tokens/base/space.tokens.json');
const originalLine = '"9": { "$value": { "value": 4, "unit": "rem" } }';
const editedLine = '"9": { "$value": { "value": 4.5, "unit": "rem" } }';

/** Puts the token line back if an earlier run left its edit, and rebuilds the outputs from it. */
async function restoreStaleEdit() {
  const current = await readFile(tokens, 'utf8');
  if (!current.includes(editedLine)) return;
  await writeFile(tokens, current.replace(editedLine, originalLine));
  await buildTokens();
}

test('a token edit rebuilds Tokens.css and updates the open catalogue in place', async ({
  page,
}) => {
  await restoreStaleEdit();
  const generated = [
    'packages/ui/src/styles/Tokens.css',
    'packages/ui/src/generated/tokens.ts',
    'packages/ui/src/generated/tokens.json',
  ].map((path) => resolve(path));
  const original = await readFile(tokens, 'utf8');
  const originalOutputs = await Promise.all(generated.map((path) => readFile(path, 'utf8')));
  const space9 = () =>
    page.evaluate(() =>
      getComputedStyle(document.querySelector('.env-theme')!).getPropertyValue('--space-9'),
    );
  try {
    await page.goto(`${catalogueUrl}/#/components/fields/preview`);
    await page.evaluate(() => {
      (window as unknown as { liveProof: string }).liveProof = 'same-document';
    });
    expect(await space9()).toBe('4rem');
    const edited = original.replace(originalLine, editedLine);
    expect(edited).not.toBe(original);
    await writeFile(tokens, edited);
    await expect.poll(space9).toBe('4.5rem');
    expect(await page.evaluate(() => (window as unknown as { liveProof: string }).liveProof)).toBe(
      'same-document',
    );
  } finally {
    await writeFile(tokens, original);
    // The restored token file rebuilds the outputs as they were; write them back in any case.
    await expect
      .poll(() => readFile(generated[0], 'utf8'))
      .toBe(originalOutputs[0])
      .catch(() => {});
    await Promise.all(generated.map((path, index) => writeFile(path, originalOutputs[index])));
  }
});
