import { test } from '@playwright/test';
import { fixtureUrl } from '../Servers';
test('probe toast action', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=toast`);
  await page.getByTestId('toast-action').click();
  const action = page.locator('.env-toast-action').first();
  await action.waitFor();
  const read = () => action.evaluate((el) => { const s = getComputedStyle(el); const t = el.closest('.env-toast')!; return { cls: el.className, variant: el.getAttribute('data-variant'), color: s.color, bg: s.backgroundColor, toastBg: getComputedStyle(t).backgroundColor, tone: t.getAttribute('data-tone') }; });
  console.log('rest', JSON.stringify(await read()));
  await action.hover();
  await page.waitForTimeout(300);
  console.log('hover', JSON.stringify(await read()));
  await page.mouse.down();
  await page.waitForTimeout(300);
  console.log('pressed', JSON.stringify(await read()));
  await page.mouse.up();
});
