import { test, expect } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { documents } from '../../apps/site/src/pages/PageModel';
import { goTo } from './helpers/SiteSpecHelpers';

// The figures of the catalogue's pages: live examples, specimens, anatomy numbering and stages.

/**
 * Every component and pattern page of the catalogue, by its address; Field's whole page is in
 * the Docs.
 */
const figurePages = documents
  .filter((document) => /^(components|patterns)\//.test(document.path) && document.id !== 'field')
  .map((document) => ({ ...document, route: `/${document.path.replace(/\.md$/, '')}` }));

test('live examples keep links in place, show their source, and specimens show forced states', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/button`);
  const address = page.url();
  // Links in an example keep their semantics without leaving the documentation.
  const destinations = page.getByRole('group', { name: 'Links example', exact: true });
  await destinations.getByRole('link', { name: 'Read the guide', exact: true }).press('Enter');
  expect(page.url()).toBe(address);
  await destinations
    .getByRole('link', { name: 'Read help', exact: true })
    .click({ modifiers: ['Control'] });
  expect(page.url()).toBe(address);
  // Every example shows the source of its file, ready to copy, right under its own figure, also
  // one that shares its row with others.
  await page
    .locator('[data-example="ButtonLinks"] ~ details summary', { hasText: 'Show code' })
    .first()
    .click();
  const code = page.getByRole('region', { name: 'Code, ButtonLinks.tsx', exact: true });
  await expect(code.locator('.env-code-block')).toContainText(
    'export default function ButtonLinks',
  );
  await expect(code.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
  await expect(
    page.locator('[data-example="ButtonLinks"] ~ details summary').first(),
  ).toContainText('Hide code');
  const gap = await code.evaluate((panel) => {
    const figure = panel.closest('.site-live-example-entry')!;
    const stage = figure.querySelector('[data-example="ButtonLinks"]')!.getBoundingClientRect();
    return Math.round(panel.getBoundingClientRect().top - stage.bottom);
  });
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThan(120);
  // Catalogue-only specimens, such as the forced interaction states, sit in the section they
  // illustrate.
  await expect(page.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
});

test('every anatomy figure numbers each part its legend names', async ({ page }) => {
  // It visits every component and pattern page, whose examples load as each opens: about 1.5
  // minutes alone, longer beside other workers.
  test.setTimeout(8 * 60_000);
  // A legend part the example doesn't render would leave its number off the figure. A part the
  // figure shows whole, such as a field around its control, takes neither.
  const pages = figurePages.map((document) => ({
    id: document.id,
    route: document.route,
    figures: (document.outline ?? [])
      .flatMap((section) => section.examples)
      .filter((example) => example.role === 'anatomy').length,
  }));
  expect(pages.length).toBeGreaterThan(0);
  // A window wide enough for every figure's parts beside the page's contents: in a narrower
  // column, Panes' figure shows one pane at a time and PanelDock's tucks a part away.
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto(`${siteDevUrl}/`);
  for (const { id, route, figures } of pages) {
    await goTo(page, route);
    const anatomy = page.locator('.site-anatomy');
    await expect(anatomy, `${id} shows its anatomy figures`).toHaveCount(figures);
    for (const figure of await anatomy.all())
      await expect
        .poll(
          () =>
            figure.evaluate((element) => {
              const badges = element.querySelectorAll('.site-anatomy-stage .site-anatomy-badge');
              const numbered = element.querySelectorAll('.site-anatomy-legend > li');
              return badges.length > 0 && badges.length === numbered.length;
            }),
          { message: `${id} numbers every part` },
        )
        .toBe(true);
  }
});

test('every stage is the only frame of its figure', async ({ page }) => {
  // It visits every component and pattern page, whose examples load as each opens: about 1.5
  // minutes alone, longer beside other workers.
  test.setTimeout(8 * 60_000);
  // One frame per figure: no stage sits inside another framed or filled box in the article, such
  // as a specimen wrapped in a Surface or a stage inside another stage. A do or don't figure's
  // stage is the figure's one frame, as a gallery cell's picture is.
  expect(figurePages.length).toBeGreaterThan(0);
  await page.goto(`${siteDevUrl}/`);
  for (const { id, route } of figurePages) {
    await goTo(page, route);
    await expect(page.locator('.site-figures .site-figure-section').first()).toBeVisible();
    await expect(page.locator('.site-loading')).toHaveCount(0);
    const framed = await page.evaluate(() => {
      const stages = document.querySelectorAll(
        '.site-figures :is(.site-live-example, .site-verdict-stage, .site-anatomy-stage, .catalogue-related-stage, .catalogue-specimen-grid, .catalogue-matrix-scroll)',
      );
      // A grid of specimens that plays takes its figure's stage as its canvas, and is no frame.
      const playing =
        '.catalogue-motion-subject :is(.catalogue-specimen-grid, .catalogue-matrix-scroll)';
      const visible = (color: string) => !/^(transparent|rgba\(.*,\s*0\))$/.test(color);
      const found: string[] = [];
      for (const stage of stages) {
        if (stage.matches(playing)) continue;
        const canvas = getComputedStyle(stage).backgroundColor;
        for (
          let node = stage.parentElement;
          node && !node.classList.contains('site-figures');
          node = node.parentElement
        ) {
          const style = getComputedStyle(node);
          const bordered = (['Top', 'Right', 'Bottom', 'Left'] as const).some(
            (side) =>
              parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
              !/none|hidden/.test(style.getPropertyValue(`border-${side.toLowerCase()}-style`)),
          );
          const filled =
            (visible(style.backgroundColor) && style.backgroundColor !== canvas) ||
            style.backgroundImage !== 'none' ||
            style.boxShadow !== 'none';
          if (bordered || filled)
            found.push(`${stage.className.split(' ')[0]} inside ${node.className || node.tagName}`);
        }
      }
      return found;
    });
    expect(framed, `${id} has a stage inside another frame`).toEqual([]);
  }
});
