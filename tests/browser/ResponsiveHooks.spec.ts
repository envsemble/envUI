import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=responsive-hooks`;

test('useMediaQuery follows the viewport, as AppShell and Sidebar ask it', async ({ page }) => {
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
