import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('public composition owns spacing and content-fit sizing without documentation CSS', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      const scope = page.getByTestId(`layout-${theme}`);
      for (const [id, step] of [
        ['layout-card', 1],
        ['layout-stack', 0.75],
        ['stacked-actions', 0.5],
      ] as const) {
        const result = await scope.getByTestId(id).evaluate((element) => {
          const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const rectangles = [...element.children].map((child) => child.getBoundingClientRect());
          return {
            root,
            gaps: rectangles.slice(1).map((rect, i) => rect.top - rectangles[i].bottom),
          };
        });
        result.gaps.forEach((gap) =>
          expect(Math.abs(gap - result.root * step), `${theme}/${id}`).toBeLessThan(1),
        );
      }
      const stack = scope.getByTestId('layout-stack');
      const stackWidth = (await stack.boundingBox())!.width;
      for (const selector of ['.env-button', '.env-nav-list-item', '.env-badge']) {
        expect((await stack.locator(selector).boundingBox())!.width).toBeLessThan(stackWidth);
      }
      const actionGroup = scope.getByTestId('stacked-actions');
      const groupWidth = (await actionGroup.boundingBox())!.width;
      for (const button of await actionGroup.locator('.env-button:not(.env-icon-button)').all()) {
        expect(Math.abs((await button.boundingBox())!.width - groupWidth)).toBeLessThan(1);
      }
      const circle = (await actionGroup.locator('.env-icon-button').boundingBox())!;
      expect(Math.abs(circle.width - circle.height)).toBeLessThan(1);
      expect(circle.width).toBeLessThan(groupWidth);
      const actionCard = scope.getByTestId('flush-action-card');
      const body = (await actionCard.locator('.env-card-body').boundingBox())!;
      const rail = (await actionCard.locator('.env-card-footer').boundingBox())!;
      expect(Math.abs(rail.y - body.y - body.height)).toBeLessThan(1);
      const extra = scope.getByTestId('feature-extra');
      // The feature layout's content follows its heading and description 1 rem apart.
      const description = (await extra.locator('.env-card-description').boundingBox())!;
      const extraContent = (await extra.locator('.env-card-body > :nth-child(2)').boundingBox())!;
      expect(extraContent.y - description.y - description.height).toBeGreaterThanOrEqual(15);
      for (const [selector, step] of [
        ['.env-card-body', 1],
        ['.env-disclosure-panel', 0.5],
      ] as const) {
        const result = await extra.locator(selector).evaluate((element) => {
          const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const rectangles = [...element.children].map((child) => child.getBoundingClientRect());
          return {
            root,
            inset: rectangles[0].top - element.getBoundingClientRect().top,
            gaps: rectangles.slice(1).map((rect, i) => rect.top - rectangles[i].bottom),
          };
        });
        expect(Math.abs(result.inset)).toBeLessThan(1);
        result.gaps.forEach((gap) => expect(Math.abs(gap - result.root * step)).toBeLessThan(1));
      }
    }
  }
});
