import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=code-block`;

/**
 * Records what the page writes to the clipboard. available: the asynchronous Clipboard API works;
 * neither: neither it nor copying a selection works, so nothing can be copied.
 */
async function recordClipboard(page: Page, mode: 'available' | 'neither') {
  await page.addInitScript((mode) => {
    const writes: string[] = [];
    (window as unknown as { clipboardWrites: string[] }).clipboardWrites = writes;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value:
        mode === 'available' ? { writeText: async (text: string) => void writes.push(text) } : {},
    });
    document.execCommand = () => false;
  }, mode);
}

const writes = (page: Page) =>
  page.evaluate(() => (window as unknown as { clipboardWrites: string[] }).clipboardWrites);

test('a code block copies its source and says so', async ({ page }) => {
  await recordClipboard(page, 'available');
  await page.goto(fixture);
  const block = page.getByTestId('install');
  // Without a label, the heading names the language and the code region says what it holds.
  await expect(block.locator('pre')).toHaveAccessibleName('sh code');
  await block.getByRole('button', { name: 'Copy code' }).click();
  expect(await writes(page)).toEqual(['npm install @envsemble/envui\nnpm run build']);
  await expect(block.getByRole('button', { name: 'Code copied' })).toBeVisible();
  await expect(block.getByRole('status')).toHaveText('Copied.');
});

test(
  'a code block that cannot copy selects its code for people to copy',
  { tag: '@engines' },
  async ({ page }) => {
    await recordClipboard(page, 'neither');
    await page.goto(fixture);
    const block = page.getByTestId('install');
    await block.getByRole('button', { name: 'Copy code' }).click();
    await expect(block.getByRole('status')).toHaveText(
      'Code selected. Use your keyboard or context menu to copy.',
    );
    // The selection covers the source; engines differ in how they serialize its line break.
    expect(await page.evaluate(() => document.getSelection()?.toString())).toMatch(
      /^npm install @envsemble\/envui\s+npm run build\s*$/,
    );
    await expect(block.getByRole('button', { name: 'Copy code' })).toBeVisible();
  },
);
