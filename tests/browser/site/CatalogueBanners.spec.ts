import { test, expect } from '@playwright/test';
import { siteDevUrl } from '../helpers/Servers';
import { componentDocuments } from '../../../apps/site/src/routes/PageModel';
import { pagesOf } from '../../../apps/site/src/routes/SiteRoutes';
import {
  bannerDrawingIndex,
  bannerSubject,
} from '../../../apps/site/src/banner/CatalogueBannerOrder';

// What the top of a catalogue page shows: the overview's hero, the banners and their credits.

test("the overview's hero says what envUI is, leads to setting it up and gives the install command", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/`);
  const hero = page.locator('.catalogue-overview-hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(hero.locator('.catalogue-overview-lede')).toContainText('A React design system');
  // The install command is short and copies; under it, one quiet line gives the catalogue's counts
  // and leads to the registry access installing needs.
  const code = hero.locator('.catalogue-overview-install code');
  await expect(code).toHaveText('npm i @envsemble/envui');
  await expect(code).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Copy install command' })).toBeVisible();
  const facts = hero.locator('.catalogue-overview-facts');
  await expect(facts).toHaveCount(1);
  await expect(facts).toContainText(
    `${componentDocuments.filter(({ id }) => id !== 'field').length} components`,
  );
  await expect(facts.getByRole('link', { name: 'registry access' })).toBeVisible();
  // One way on of its own, to setting envUI up, and the setup's registry access; the sidebar and
  // the Explore cards lead elsewhere.
  await expect(hero.getByRole('link')).toHaveText(['Get started', 'registry access']);
  await expect(hero.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/docs');
  await expect(hero.getByRole('link', { name: 'registry access' })).toHaveAttribute(
    'href',
    '/docs#registry-access',
  );
  // The command is as tall as Get started beside it.
  const start = hero.getByRole('link', { name: 'Get started' });
  const install = hero.locator('.catalogue-overview-install');
  const height = async (locator: typeof install) => (await locator.boundingBox())!.height;
  expect(await height(install)).toBeCloseTo(await height(start), 0);
  // A phone shows the same command, the one the button copies, whole and on one line, with room
  // to spare before the copy button.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => code.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBe(0);
  expect((await install.boundingBox())!.width).toBeLessThan(390 * 0.75);
  await expect(code).toHaveCSS('white-space', 'nowrap');
});

test("a catalogue page's banner reads from the start under its breadcrumbs, its picture hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components/slider`);
  const banner = page.locator('.site-page-banner');
  const trail = banner.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(trail.getByRole('link')).toHaveText(['envUI', 'Components', 'Forms & selection']);
  await expect(trail.getByRole('link', { name: 'Forms & selection' })).toHaveAttribute(
    'href',
    '/components#components-forms-selection',
  );
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Slider');
  await expect(banner.locator('.site-page-banner-content')).toHaveCSS('text-align', 'start');
  // Its picture is a LineArt drawing out of the accessibility tree, in a box at the banner's end,
  // cropped from its start.
  const shapes = banner.locator('.site-banner-shapes');
  await expect(shapes).toHaveAttribute('aria-hidden', 'true');
  const lines = shapes.locator('.env-line-art.catalogue-banner-lines');
  await expect(lines).toHaveAttribute('data-align', 'end');
  await expect(lines.locator(':is(rect, circle, polygon, path, line)').first()).toHaveCSS(
    'fill',
    'none',
  );
  const [box, bannerBox] = await Promise.all([lines.boundingBox(), banner.boundingBox()]);
  expect(Math.abs(box!.x + box!.width - (bannerBox!.x + bannerBox!.width))).toBeLessThan(1);
  expect(box!.width).toBeCloseTo(Math.min(bannerBox!.width * 0.48, 42 * 16), 0);
  await expect(banner.locator('.catalogue-banner-motif')).toHaveCount(0);
  // The one page with a motif of its own, Colors & themes, draws it out of the
  // accessibility tree and the tab order.
  await page.goto(`${siteDevUrl}/foundations/colors`);
  const motif = page.locator('.site-page-banner .catalogue-banner-motif');
  await expect(motif).toHaveAttribute('aria-hidden', 'true');
  await expect(motif).toHaveAttribute('inert', '');
  await expect(motif.locator('[data-motif="swatches"] .catalogue-motif-swatch')).toHaveCount(6);
  await expect(page.locator('.site-page-banner .site-banner-shapes')).toHaveCount(0);
});

test("neighbouring catalogue pages' banners show different drawings, each page always the same", async ({
  page,
}) => {
  // The drawings take turns along the catalogue's order, the sidebar's and the galleries': no two
  // neighbours share one, and none recurs within sixteen pages.
  const drawings = 16; // LineArt's, lineArtDrawings.length
  const order = pagesOf('catalogue').map((route) => ({
    path: route.path,
    drawing: bannerDrawingIndex(bannerSubject(route), drawings),
  }));
  for (let index = 0; index < order.length; index += 1) {
    const run = order.slice(index, index + drawings).map(({ drawing }) => drawing);
    expect(new Set(run).size, `the sixteen pages from ${order[index]!.path}`).toBe(run.length);
  }
  // On the pages themselves: the last of the actions, then the first two of the forms.
  const start = order.findIndex(({ path }) => path === 'components/command-palette');
  const shown: string[] = [];
  for (const { path } of [...order.slice(start, start + 3), order[start]!]) {
    await page.goto(`${siteDevUrl}/${path}`);
    const drawing = await page
      .locator('.site-page-banner .catalogue-banner-lines')
      .getAttribute('data-drawing');
    shown.push(drawing!);
  }
  expect(new Set(shown.slice(0, 3)).size).toBe(3);
  expect(shown[3]).toBe(shown[0]);
  // The page's banner in the Docs shows the same drawing as its banner in the catalogue.
  await page.goto(`${siteDevUrl}/docs/${order[start]!.path}`);
  await expect(page.locator('.site-page-banner .docs-banner-lines')).toHaveAttribute(
    'data-drawing',
    shown[0]!,
  );
});

test('the Icons page credits Material Symbols with their license at its top, and the footer does not', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/foundations/icons`);
  const credit = page.locator('.catalogue-icons-credit .env-alert');
  await expect(credit).toHaveAttribute('data-tone', 'info');
  await expect(credit).toContainText("envUI doesn't draw icons of its own");
  // Under the banner, before the page's first section.
  const first = page.locator('.site-section-group').first();
  const [creditBox, firstBox] = [await credit.boundingBox(), await first.boundingBox()];
  expect(creditBox!.y).toBeLessThan(firstBox!.y);
  await expect(credit.getByRole('link', { name: 'Material Symbols' })).toHaveAttribute(
    'href',
    'https://m3.material.io/styles/icons',
  );
  await expect(credit.getByRole('link', { name: 'Apache License 2.0' })).toHaveAttribute(
    'href',
    'https://www.apache.org/licenses/LICENSE-2.0',
  );
  await expect(page.locator('.site-footer')).not.toContainText('Material Symbols');
});
