import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** The inline end of the heading row and of its meta, in the row's own direction. */
async function metaPlacement(card: Locator) {
  return card.locator('.env-action-card-heading').evaluate((row) => {
    const meta = row.querySelector('.env-action-card-meta')!.getBoundingClientRect();
    const heading = row.querySelector('h3')!.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === 'rtl';
    return {
      gapToEnd: Math.round(rtl ? meta.left - box.left : box.right - meta.right),
      afterHeading: rtl ? meta.right <= heading.left : meta.left >= heading.right,
      sameLine: Math.abs(meta.top + meta.height / 2 - (heading.top + heading.height / 2)) < 4,
    };
  });
}

test('card meta sits at the end of the heading row in both themes and directions', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`layout-${theme}`);
    for (const id of ['meta-action-card', 'meta-card']) {
      const card = scope.getByTestId(id);
      await expect(card.locator('.env-action-card-meta')).toBeVisible();
      expect(await metaPlacement(card)).toEqual({
        gapToEnd: 0,
        afterHeading: true,
        sameLine: true,
      });
    }
  }
  const card = page.getByTestId('layout-light').getByTestId('meta-action-card');
  await card.evaluate((element) => element.setAttribute('dir', 'rtl'));
  expect(await metaPlacement(card)).toEqual({ gapToEnd: 0, afterHeading: true, sameLine: true });
});
