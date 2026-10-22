import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a diff stat is one pill with additions in green and deletions in red, named in full', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=button-counts`);
  for (const theme of ['light', 'dark']) {
    const count = page.getByTestId(`diff-stat-${theme}`);
    await expect(count.locator('.env-diff-stat-additions')).toHaveText('+12');
    await expect(count.locator('.env-diff-stat-deletions')).toHaveText('−3');
    await expect(count.locator('.env-diff-stat-label')).toHaveText(
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
        getComputedStyle(element.querySelector('.env-diff-stat-additions')!).color,
        getComputedStyle(element.querySelector('.env-diff-stat-deletions')!).color,
        probe('var(--env-color-fg-success)'),
        probe('var(--env-color-fg-danger)'),
      ];
    });
    expect(additions).toBe(success);
    expect(deletions).toBe(danger);
    // As tall as a count badge, so it sits in the same places.
    const counter = (await page
      .getByTestId(`button-counts-${theme}`)
      .locator('.env-badge[data-count]')
      .first()
      .boundingBox())!;
    expect(Math.abs((await count.boundingBox())!.height - counter.height)).toBeLessThan(0.5);
  }
});
