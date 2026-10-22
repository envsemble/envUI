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
        ['layout-column', 0.75],
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
      const column = scope.getByTestId('layout-column');
      const columnWidth = (await column.boundingBox())!.width;
      for (const selector of ['.env-button', '.env-badge']) {
        expect((await column.locator(selector).boundingBox())!.width).toBeLessThan(columnWidth);
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
      // A card's content follows its heading and description 1 rem apart.
      const description = (await extra.locator('.env-card-description').boundingBox())!;
      const extraContent = (await extra.locator('.env-card-body > :nth-child(3)').boundingBox())!;
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

test.describe('layout primitives', () => {
  test('lay out with flex and grid at the spacing steps, and never paint', async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=layout`);
    const scope = page.getByTestId('primitives');
    const styles = (testId: string) =>
      scope.getByTestId(testId).evaluate((element) => {
        const style = getComputedStyle(element);
        const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return {
          tag: element.tagName,
          layout: element.getAttribute('data-env-layout'),
          name: element.getAttribute('data-env-name'),
          display: style.display,
          direction: style.flexDirection,
          align: style.alignItems,
          gap: parseFloat(style.columnGap) / root,
          rowGap: parseFloat(style.rowGap) / root,
          padding: parseFloat(style.paddingTop) / root,
          columns: style.gridTemplateColumns.split(' ').length,
          background: style.backgroundColor,
          border: style.borderTopStyle,
          containerType: style.containerType,
          containerName: style.containerName,
        };
      });
    const row = await styles('row');
    expect(row).toMatchObject({ layout: 'row', name: 'actions', display: 'flex' });
    expect(row).toMatchObject({ direction: 'row', align: 'center', gap: 0.75 });
    expect(row).toMatchObject({ background: 'rgba(0, 0, 0, 0)', border: 'none' });
    expect(await styles('column')).toMatchObject({
      tag: 'SECTION',
      layout: 'column',
      display: 'flex',
      direction: 'column',
      rowGap: 1.5,
      padding: 1,
    });
    // 32 rem holds three columns of at least 10 rem, 0.5 rem apart.
    expect(await styles('grid-min')).toMatchObject({ display: 'grid', columns: 3, gap: 0.5 });
    expect(await styles('grid-count')).toMatchObject({ columns: 4 });
    const template = await scope
      .getByTestId('grid-template')
      .evaluate((element) =>
        [...element.children].map((child) => child.getBoundingClientRect().width),
      );
    expect(template[0] / template[1]).toBeCloseTo(2, 1);
    // A grid without columns is one column, also inside a grid with columns of its own.
    expect(await styles('grid-inner')).toMatchObject({ columns: 1 });
    const box = await styles('box');
    expect(box).toMatchObject({ layout: 'box', display: 'block', padding: 0.5 });
    expect(box).toMatchObject({ containerType: 'inline-size', containerName: 'probe' });
    // The Box is the probe container that the fixture's query sees.
    expect(
      await scope
        .getByTestId('box-child')
        .evaluate((element) => getComputedStyle(element).getPropertyValue('--fixture-in-probe')),
    ).toBe('yes');
  });

  test('have no specificity, so any class in the same layer overrides them', async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=layout`);
    await page.addStyleTag({
      content: "@layer env.components { [data-testid='row-override'] { gap: 0.125rem; } }",
    });
    const gap = await page
      .getByTestId('row-override')
      .evaluate(
        (element) =>
          parseFloat(getComputedStyle(element).columnGap) /
          parseFloat(getComputedStyle(document.documentElement).fontSize),
      );
    expect(gap).toBe(0.125);
  });
});
