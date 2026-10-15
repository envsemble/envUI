import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('counters and badges in buttons and tabs keep 4.5:1 contrast in both themes', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=button-counts`);
  // Two themes: two tabs and five buttons with a counter and a badge each.
  await expect(page.locator('.env-counter')).toHaveCount(14);
  await expect(page.locator('.env-badge')).toHaveCount(10);
  // Two themes: a diff count in a tab, in five buttons and on the page.
  await expect(page.locator('.env-diff-count')).toHaveCount(14);
  const measure = () =>
    page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const luminance = (colors: string[]) => {
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
      for (const pill of document.querySelectorAll<HTMLElement>(
        '.env-counter, .env-badge, .env-diff-count-additions, .env-diff-count-deletions',
      )) {
        // The pill's text over every fill below it: its own, the button's and the surface's.
        const layers: string[] = [];
        for (let element: HTMLElement | null = pill; element; element = element.parentElement) {
          layers.unshift(getComputedStyle(element).backgroundColor);
          if (element.classList.contains('env-theme')) break;
        }
        const back = luminance(layers);
        const front = luminance([...layers, getComputedStyle(pill).color]);
        const [lighter, darker] = [back, front].sort((a, b) => b - a);
        const ratio = (lighter! + 0.05) / (darker! + 0.05);
        if (ratio < 4.5) {
          const theme = pill.closest('[data-env-theme]')!.getAttribute('data-env-theme');
          const button = pill.closest('button')!;
          results.push(
            `${theme} ${button.textContent} (${button.getAttribute('aria-selected') ?? 'button'}): ${ratio.toFixed(2)}`,
          );
        }
      }
      return results;
    });
  await page.mouse.move(0, 0);
  expect(await measure()).toEqual([]);
  // Switching tabs swaps which counter sits on the selected fill; both stay readable.
  for (const theme of ['light', 'dark']) {
    const tabs = page.getByRole('tablist', { name: `Form views ${theme}` });
    await tabs.getByRole('tab', { name: /Drafts/ }).click();
    await expect(tabs.getByRole('tab', { name: /Drafts/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const views = page.getByRole('tablist', { name: `Editor views ${theme}` });
    await views.getByRole('tab', { name: /Diffs/ }).click();
    await expect(views.getByRole('tab', { name: /Diffs/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  }
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  expect(await measure()).toEqual([]);
});

test('a diff count is one pill with additions in green and deletions in red, named in full', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=button-counts`);
  for (const theme of ['light', 'dark']) {
    const count = page.getByTestId(`diff-count-${theme}`);
    await expect(count.locator('.env-diff-count-additions')).toHaveText('+12');
    await expect(count.locator('.env-diff-count-deletions')).toHaveText('−3');
    await expect(count.locator('.env-counter-label')).toHaveText(
      '12 added lines and 3 removed lines',
    );
    const [additions, deletions, success, danger] = await count.evaluate((element) => {
      const probe = (color: string) => {
        const span = document.createElement('span');
        span.style.color = color;
        element.append(span);
        const value = getComputedStyle(span).color;
        span.remove();
        return value;
      };
      return [
        getComputedStyle(element.querySelector('.env-diff-count-additions')!).color,
        getComputedStyle(element.querySelector('.env-diff-count-deletions')!).color,
        probe('var(--color-tone-success)'),
        probe('var(--color-tone-danger)'),
      ];
    });
    expect(additions).toBe(success);
    expect(deletions).toBe(danger);
    // As tall as a counter, so it sits in the same places.
    const counter = (await page
      .getByTestId(`button-counts-${theme}`)
      .locator('.env-counter')
      .first()
      .boundingBox())!;
    expect(Math.abs((await count.boundingBox())!.height - counter.height)).toBeLessThan(0.5);
  }
});
