import { test, expect } from '@playwright/test';

test('FeatureCard responds to its own width without consumer containment CSS', async ({ page }) => {
  await page.goto('http://127.0.0.1:8766/?fixture=feature-cards');
  for (const name of ['icon', 'plain']) {
    const card = page.getByTestId(`standalone-feature-${name}`);
    const copy = card.locator('.env-feature-card-copy');
    const action = card.locator('.env-feature-card-action');
    const button = action.getByRole('button');
    await expect
      .poll(() => card.evaluate((element) => getComputedStyle(element).containerType))
      .toBe('inline-size');
    for (const [width, stacked] of [
      ['24rem', true],
      ['60rem', false],
    ] as const) {
      await card.evaluate((element, value) => {
        (element as HTMLElement).style.width = value;
      }, width);
      const copyRect = (await copy.boundingBox())!;
      const actionRect = (await action.boundingBox())!;
      const buttonRect = (await button.boundingBox())!;
      if (stacked) {
        expect(actionRect.y).toBeGreaterThanOrEqual(copyRect.y + copyRect.height);
        const layoutRect = (await card.locator('.env-feature-card-layout').boundingBox())!;
        expect(Math.abs(buttonRect.width - layoutRect.width)).toBeLessThan(1);
      } else {
        expect(actionRect.x).toBeGreaterThanOrEqual(copyRect.x + copyRect.width);
        expect(
          Math.abs(actionRect.y + actionRect.height / 2 - copyRect.y - copyRect.height / 2),
        ).toBeLessThan(1);
      }
    }
  }
});
