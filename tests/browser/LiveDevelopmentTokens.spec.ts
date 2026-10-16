import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalogueUrl } from './Servers';

test('a token edit rebuilds Tokens.css and updates the open catalogue in place', async ({
  page,
}) => {
  const tokens = resolve('packages/ui/tokens/base/space.tokens.json');
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
    const edited = original.replace(
      '"9": { "$value": { "value": 4, "unit": "rem" } }',
      '"9": { "$value": { "value": 4.5, "unit": "rem" } }',
    );
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
