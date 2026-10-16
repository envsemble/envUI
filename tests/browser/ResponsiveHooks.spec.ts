import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=responsive-hooks`;

test('useBreakpoint and useMediaQuery follow the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto(fixture);
  const breakpoint = page.getByTestId('breakpoint');
  const orientation = page.getByTestId('orientation');
  await expect(breakpoint).toHaveText('md and up');
  await expect(orientation).toHaveText('landscape');
  // 48 rem is 768 px at the default text size: one pixel less is below md.
  await page.setViewportSize({ width: 767, height: 900 });
  await expect(breakpoint).toHaveText('below md');
  await expect(orientation).toHaveText('portrait');
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(breakpoint).toHaveText('md and up');
});

test('a shortcut goes to the latest visible handler and leaves typing alone', async ({ page }) => {
  await page.goto(fixture);
  const pressed = page.getByTestId('pressed');
  await expect(page.locator('[data-ready]')).toBeAttached();
  // Playwright's ControlOrMeta is the platform's mod key, as the hook reads it.
  await page.keyboard.press('ControlOrMeta+k');
  await expect(pressed).toHaveText('Second search');
  await page.getByRole('button', { name: 'Toggle the second search' }).click();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(pressed).toHaveText('Second search, First search');
  // In a text field, Mod+B belongs to the field.
  await page.getByRole('textbox', { name: 'Notes' }).focus();
  await page.keyboard.press('ControlOrMeta+b');
  await expect(pressed).toHaveText('Second search, First search');
  await page.getByRole('button', { name: 'Toggle the second search' }).focus();
  await page.keyboard.press('ControlOrMeta+b');
  await expect(pressed).toHaveText('Second search, First search, bold shortcut');
});
