import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/**
 * A star's box and its half fill's, read in one layout: as the page's font loads, the number before
 * the stars widens and moves them, so boxes read one after the other could straddle that move.
 */
const starAndHalf = (star: Locator) =>
  star.evaluate((element) => {
    const box = (part: Element) => {
      const { x, width } = part.getBoundingClientRect();
      return { x, width };
    };
    return [box(element), box(element.querySelector('.env-rating-star-half')!)] as const;
  });

test('a rating fills its stars to the value in half steps and is named once', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=ratings`);
  for (const theme of ['light', 'dark']) {
    const half = page.getByTestId(`rating-half-${theme}`);
    // One image named by the rating; the number beside it is hidden from assistive technology.
    await expect(half.getByRole('img')).toHaveAccessibleName('3.5 out of 5 stars');
    await expect(half.locator('.env-rating-value')).toHaveText('3.5');
    await expect(half.locator('.env-rating-value')).toHaveAttribute('aria-hidden', 'true');
    const stars = half.locator('.env-rating-star');
    await expect(stars).toHaveCount(5);
    await expect(half.locator('.env-rating-star[data-fill="full"]')).toHaveCount(3);
    // The half star fills its start half in the stars' gold over the empty star.
    const halfStar = stars.nth(3);
    const [starBox, fillBox] = await starAndHalf(halfStar);
    expect(Math.abs(fillBox.width - starBox.width / 2)).toBeLessThan(1);
    expect(Math.abs(fillBox.x - starBox.x)).toBeLessThan(1);
    const [full, empty, fill] = await half.evaluate((element) => {
      const color = (selector: string) => getComputedStyle(element.querySelector(selector)!).color;
      return [
        color('.env-rating-star[data-fill="full"]'),
        color('.env-rating-star:not([data-fill])'),
        color('.env-rating-star-half'),
      ];
    });
    expect(full).toBe(fill);
    expect(full).not.toBe(empty);
    // Other scales, values kept within the scale, and the label in another wording.
    await expect(page.getByTestId(`rating-ten-${theme}`).locator('.env-rating-star')).toHaveCount(
      10,
    );
    await expect(page.getByTestId(`rating-over-${theme}`).getByRole('img')).toHaveAccessibleName(
      '5/5',
    );
    // In right-to-left text the half star fills its right half.
    const rtlHalf = page.getByTestId(`rating-rtl-${theme}`).locator('.env-rating-star').nth(2);
    const [rtlStar, rtlFill] = await starAndHalf(rtlHalf);
    expect(Math.abs(rtlFill.x + rtlFill.width - (rtlStar.x + rtlStar.width))).toBeLessThan(1);
  }
});

test("ratings, changes and rolling numbers follow the provider's locale and messages", async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=ratings`);
  const scope = page.getByTestId('ratings-light');
  const rating = scope.getByTestId('rating-de-light');
  await expect(rating.locator('.env-rating-value')).toHaveText('4,5');
  await expect(rating.getByRole('img')).toHaveAccessibleName('4,5 out of 5 stars');
  await expect(scope.getByTestId('rating-de-named-light').getByRole('img')).toHaveAccessibleName(
    '3,5 von 5 Sternen',
  );
  const diff = scope.getByTestId('diff-de-light');
  await expect(diff.locator('.env-diff-stat-additions')).toHaveText('+1.234');
  await expect(diff.locator('.env-diff-stat-label')).toHaveText(
    '1.234 added lines and 5 removed lines',
  );
  await expect(scope.getByTestId('number-de-light')).toHaveText('12.800');
});
