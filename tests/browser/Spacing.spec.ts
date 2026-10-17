import { test, expect } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';
import {
  findReferencePage,
  normalizeRoute,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';

const components = [
  'stack',
  'button',
  'text-field',
  'checkbox',
  'switch',
  'radio',
  'select',
  'nav-list',
  'list',
  'card',
  'disclosure',
  'empty-state',
  'spinner',
  'skeleton',
  'toast',
  'dialog',
];
const foundations = ['colors', 'typography', 'spacing', 'composition', 'icons', 'accessibility'];

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

test('all documentation views retain explicit content gaps and a single preview', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const routes = [
    'overview',
    'overview/get-started',
    'components',
    ...foundations.map((id) => `foundations/${id}`),
    // Every view of each page: Preview and Usage, or the views of a page on the template.
    ...components.flatMap((id) =>
      findReferencePage(`components/${id}`)!.views.map((view) => `components/${id}/${view.id}`),
    ),
  ];
  await page.goto(`${catalogueUrl}/#/overview`);
  for (const width of [1920, 960]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.evaluate((route) => {
        location.hash = `/${route}`;
      }, route);
      const destination = normalizeRoute(route);
      const reference = findReferencePage(destination);
      const view = reference
        ? reference.views.find((item) => item.id === destination.split('/')[2])!.title
        : destination.startsWith('overview/get-started')
          ? 'Get started'
          : 'Components';
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Wait for React to commit this route and view before measuring its layout.
      await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
        reference?.reference.title ?? 'envUI',
      );
      await expect(
        page.locator('.docs-page-header').getByRole('tab', { selected: true }),
      ).toHaveText(view);
      await expect(page.getByText(/^Loading (?:icons|icon usage|rich text)…$/)).toHaveCount(0);
      const result = await page.evaluate(() => {
        const faults: string[] = [];
        const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
        document
          .querySelectorAll(
            // A row stack spaces its children across, not down.
            '.docs-example, .docs-article > section, .env-card-content, .env-stack:not([data-direction=row])',
          )
          .forEach((parent) => {
            const style = getComputedStyle(parent);
            const gap = parseFloat(style.rowGap);
            const children = [...parent.children].filter((child) => {
              const css = getComputedStyle(child);
              return (
                css.display !== 'none' &&
                !['absolute', 'fixed'].includes(css.position) &&
                child.getBoundingClientRect().height > 0
              );
            });
            children.slice(1).forEach((child, i) => {
              const previous = children[i].getBoundingClientRect();
              const current = child.getBoundingClientRect();
              if (current.top - previous.bottom < gap - 1)
                faults.push(`${parent.className}: ${children[i].tagName} → ${child.tagName}`);
            });
            if (
              !Number.isFinite(gap) ||
              (parent.matches('.docs-example, .docs-article > section, .env-card-content') &&
                gap < root - 1)
            )
              faults.push(`${parent.className}: missing standard gap`);
          });
        // Specimens inside an article bring their own frame; a page has one preview pane.
        const panes = [
          ...document.querySelectorAll('.docs-preview:not(.docs-article .docs-preview)'),
        ];
        if (panes.length > 1) faults.push('Duplicate preview');
        return faults;
      });
      expect(result, `${width}: ${route}`).toEqual([]);
    }
  }
});
