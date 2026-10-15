import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

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
    // The half star fills its start half in the warning tone over the empty star.
    const halfStar = stars.nth(3);
    const [starBox, fillBox] = await Promise.all([
      halfStar.boundingBox(),
      halfStar.locator('.env-rating-star-half').boundingBox(),
    ]);
    expect(Math.abs(fillBox!.width - starBox!.width / 2)).toBeLessThan(1);
    expect(Math.abs(fillBox!.x - starBox!.x)).toBeLessThan(1);
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
    const [rtlStar, rtlFill] = await Promise.all([
      rtlHalf.boundingBox(),
      rtlHalf.locator('.env-rating-star-half').boundingBox(),
    ]);
    expect(Math.abs(rtlFill!.x + rtlFill!.width - (rtlStar!.x + rtlStar!.width))).toBeLessThan(1);
  }
});

test('a color swatch takes the size of a button icon and stays visible with a ring', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=ratings`);
  for (const theme of ['light', 'dark']) {
    const button = page.getByRole('button', { name: `#FFFFFF ${theme}` });
    const swatch = button.locator('.env-color-swatch');
    await expect(swatch).toHaveAttribute('aria-hidden', 'true');
    const [swatchBox, iconBox] = await Promise.all([
      swatch.boundingBox(),
      button.locator('.env-symbol').boundingBox(),
    ]);
    expect(Math.abs(swatchBox!.width - iconBox!.width)).toBeLessThan(1);
    expect(Math.abs(swatchBox!.height - iconBox!.height)).toBeLessThan(1);
    const [background, ring] = await swatch.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.backgroundColor, style.boxShadow];
    });
    expect(background).toBe('rgb(255, 255, 255)');
    expect(ring).toContain('inset');
  }
});
