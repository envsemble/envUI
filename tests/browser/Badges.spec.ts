import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('badge and tone text keep 4.5:1 contrast on canvas, panes and rows in both themes', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=badges`);
  // Composite each element's text color over its own fill and the surface below, as painted.
  const failures = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const paint = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const results: string[] = [];
    for (const element of document.querySelectorAll<HTMLElement>(
      '[data-testid="badge"], [data-testid="tone-text"]',
    )) {
      const surface = getComputedStyle(element.closest('[data-surface]')!).backgroundColor;
      const fill = getComputedStyle(element).backgroundColor;
      const text = getComputedStyle(element).color;
      const background = paint([surface, fill]);
      const foreground = paint([surface, fill, text]);
      const [lighter, darker] = [background, foreground].sort((a, b) => b - a);
      const ratio = (lighter! + 0.05) / (darker! + 0.05);
      if (ratio < 4.5) {
        const theme = element.closest('[data-env-theme]')!.getAttribute('data-env-theme');
        const where = element.closest<HTMLElement>('[data-surface]')!.dataset.surface;
        results.push(`${theme} ${where} ${element.textContent}: ${ratio.toFixed(2)}`);
      }
    }
    return results;
  });
  expect(failures).toEqual([]);
  // Two themes, three surfaces, eighteen badges and six tone texts each.
  await expect(page.locator('[data-testid="badge"], [data-testid="tone-text"]')).toHaveCount(144);

  const scope = page.getByTestId('badges-light');
  await expect(scope.getByRole('button', { name: 'Inbox 12 unread' })).toBeVisible();
  const iconOnly = scope.getByRole('button', { name: 'Inbox with unread' });
  await expect(iconOnly.locator('.env-navigation-dot')).toBeVisible();
  await expect(iconOnly.locator('.env-counter')).toHaveCount(0);
});
