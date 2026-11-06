import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { chooseScheme } from './helpers/CatalogueThemes';
import { documents, componentDocuments } from '../../apps/site/src/pages/PageModel';
import type * as PageModel from '../../apps/site/src/pages/PageModel';
import type * as RelatedPages from '../../apps/site/src/template/RelatedPages';
import type { DocumentationMetadata } from '../../apps/site/src/shared/DocumentationTypes';
import { goTo } from './helpers/SiteSpecHelpers';
import { pagesOf } from '../../apps/site/src/navigation/SiteRoutes';
import { bannerDrawingIndex, bannerSubject } from '../../apps/site/src/layout/CatalogueBannerOrder';

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

test('a component page shows plain sections, equal cells and the parts of its anatomy', async ({
  page,
}) => {
  // Wide enough for an overview's three figures to share a row beside the page's contents.
  await page.setViewportSize({ width: 1920, height: 900 });
  // Figures that share a row are cells of one width, from the top of the row, each stage as tall
  // as its own figure: a stage stretched to a taller neighbour's left a lone control floating.
  await page.goto(`${siteDevUrl}/components/badge`);
  await expect(page.locator('[data-section="overview"] .site-loading')).toHaveCount(0);
  const cells = () =>
    page
      .locator('[data-section="overview"] .site-figure-run')
      .first()
      .evaluate((run) => {
        const stages = [...run.querySelectorAll('.site-live-example')].map((stage) =>
          stage.getBoundingClientRect(),
        );
        return {
          count: stages.length,
          widths: new Set(stages.map((box) => Math.round(box.width))).size,
          tops: new Set(stages.map((box) => Math.round(box.top))).size,
          heights: new Set(stages.map((box) => Math.round(box.height))).size > 1,
        };
      });
  await expect.poll(cells).toEqual({ count: 3, widths: 1, tops: 1, heights: true });
  // Each figure's caption or code follows its stage closely, with no empty band.
  const codeGaps = () =>
    page
      .locator('[data-section="overview"] .site-figure-run')
      .first()
      .evaluate((run) =>
        [...run.children].map((figure) => {
          const [stage, next] = [...figure.children].map((child) => child.getBoundingClientRect());
          return { gap: Math.round(next.top - stage.bottom) };
        }),
      );
  expect(new Set((await codeGaps()).map(({ gap }) => gap)).size).toBe(1);
  await page.goto(`${siteDevUrl}/components/button`);
  // One page of sections, with no views; the props are on its page in the Docs, which the banner's
  // Design and Code switch opens, Design marked as the page shown.
  await expect(page.locator('.site-page-header').getByRole('tab')).toHaveCount(0);
  const partSwitch = page
    .locator('.site-page-header')
    .getByRole('navigation', { name: 'Design or code' });
  await expect(partSwitch.getByRole('link', { name: 'Code', exact: true })).toHaveAttribute(
    'href',
    '/docs/components/button',
  );
  await expect(partSwitch.getByRole('link', { name: 'Design', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  // Ordinary headings in the fixed order, and no questions.
  // The one-file structure's sections, which every kind of page shares.
  await expect(page.locator('.site-figure-section-heading h2')).toHaveText([
    'Overview',
    'Variants',
    'Anatomy',
    'Behaviour',
    'Rules',
    'Accessibility',
  ]);
  await expect(page.locator('.site-figures .env-message')).toHaveCount(0);
  // Do and don't figures carry their verdict and one sentence, with the code below.
  const verdict = page.getByRole('figure', { name: /^Do One primary button per group/ });
  await expect(verdict.locator('.site-verdict-bar')).toHaveText('Do');
  await expect(verdict.locator('details summary')).toHaveText('Show code, OnePrimaryAction.tsx');
  // Its stage and its bar are connected rows: large outer corners, small inner ones.
  const corners = await verdict.evaluate((figure) => {
    const stage = getComputedStyle(figure.querySelector('.site-verdict-stage')!);
    const bar = getComputedStyle(figure.querySelector('.site-verdict-bar')!);
    return {
      outer: stage.borderTopLeftRadius === bar.borderBottomLeftRadius,
      inner: stage.borderBottomLeftRadius === bar.borderTopLeftRadius,
      larger: parseFloat(stage.borderTopLeftRadius) > parseFloat(stage.borderBottomLeftRadius),
    };
  });
  expect(corners).toEqual({ outer: true, inner: true, larger: true });
  // When to use is a guidance list, marked with sparks, where a component named at an item's end
  // follows it after a muted dot: the Button family's own page, so not a link.
  const useWhen = page.locator('.site-when .site-guidance li');
  await expect(useWhen.nth(2)).toHaveText(
    'A familiar action as an icon alone, in a dense place · IconButton',
  );
  await expect(page.locator('.site-when .catalogue-list-name')).toHaveText([
    'IconButton',
    'ConfirmButton',
    'CopyButton',
    'ButtonGroup',
  ]);
  await expect(page.locator('.site-when a')).toHaveCount(0);
  // Related, at the end, has a tile for each alternative, of one size, each a picture of it,
  // inert and fitted to its stage, once the section nears the viewport.
  await expect(page.locator('[data-section="usage"] .catalogue-related-tile')).toHaveCount(0);
  const tiles = page.locator('[data-section="related"] .catalogue-related-tile');
  await expect(tiles.locator('.catalogue-related-name')).toHaveText([
    'Link',
    'SegmentedControl',
    'Switch',
    'Menu',
    'Dialog',
  ]);
  await tiles.first().scrollIntoViewIfNeeded();
  const tileStages = () =>
    tiles.locator('.catalogue-related-stage').evaluateAll((stages) => ({
      widths: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().width))).size,
      heights: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().height)))
        .size,
      fitted: stages.filter((stage) =>
        stage.querySelector('.catalogue-related-canvas[data-fitted][inert]'),
      ).length,
    }));
  await expect.poll(tileStages).toEqual({ widths: 1, heights: 1, fitted: 5 });
  // The anatomy numbers each part of the live button beside the part it names, in the theme the
  // reader has chosen alone, and keeps them there as the page narrows and the theme changes.
  // The variants figure names each variant in plain text on the start side of its item.
  const variantNames = page.locator('.catalogue-variants .catalogue-variant-label');
  await variantNames.first().scrollIntoViewIfNeeded();
  await expect(variantNames).toHaveText([
    'Primary',
    'Secondary',
    'Outline',
    'Ghost',
    'Text',
    'Primary, accent',
  ]);
  await expect(variantNames.first()).toHaveAttribute('data-side', 'left');
  const stages = page.locator('.site-anatomy .site-anatomy-stage');
  await expect(stages).toHaveCount(1);
  const placement = () =>
    stages.evaluate((stage) => {
      // Until the example and its badges render, there is nothing to place: poll again.
      // The icon's number is the one its legend entry has: the callouts number the parts in the
      // order the figure is read.
      const iconElement = stage.querySelector('.env-button > .env-icon');
      const entry = [
        ...(stage.closest('figure')?.querySelectorAll('.site-anatomy-legend > li') ?? []),
      ].find((item) => item.textContent?.includes('Start icon'));
      const number = entry?.querySelector('.site-anatomy-number')?.textContent;
      const badgeElement = [...stage.querySelectorAll('.site-anatomy-badge')].find(
        (item) => item.textContent === number,
      );
      if (!iconElement || !badgeElement) return null;
      const icon = iconElement.getBoundingClientRect();
      const badge = badgeElement.getBoundingClientRect();
      return {
        badges: stage.querySelectorAll('.site-anatomy-badge').length,
        // Centred on the icon, give or take the rounding of a centred stage.
        aligned: Math.abs(badge.left + badge.width / 2 - (icon.left + icon.width / 2)) <= 1,
        theme: stage.getAttribute('data-env-theme'),
      };
    });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'light' });
  await chooseScheme(page, 'dark');
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await page.setViewportSize({ width: 420, height: 800 });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await expect(page.locator('.site-anatomy-legend > li')).toHaveCount(4);
  // One to a row, each figure's caption or code follows its stage as closely.
  await page.goto(`${siteDevUrl}/components/badge`);
  await expect(page.locator('[data-section="overview"] .site-loading')).toHaveCount(0);
  const column = await codeGaps();
  expect(new Set(column.map(({ gap }) => gap)).size).toBe(1);
});

test('every anatomy figure numbers each part its legend names', async ({ page }) => {
  // It visits every component and pattern page, whose examples load as each opens.
  test.slow();
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
  // It visits every component and pattern page, whose examples load as each opens.
  test.slow();
  // One frame per figure: no stage sits inside another framed or filled box in the article, such
  // as a specimen wrapped in a Surface or a stage inside another stage. A do or don't figure's own
  // frame, which holds its stage and its verdict bar, is the figure's one frame.
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
          if (node.classList.contains('site-verdict-frame')) continue;
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

test('a component page groups its sections into three, all on the page', async ({ page }) => {
  // Overview with Variants, Anatomy and Behaviour; Rules, which opens with Use it when; Accessibility;
  // then Related. A page groups the sections it has, every group on the page's own background, as
  // far from the next as any other.
  const groups = () =>
    page.locator('.site-section-groups > *').evaluateAll((elements) =>
      elements.map((element) => ({
        group: element.classList.contains('site-section-group'),
        sections: [...element.querySelectorAll('[data-section]')].map(
          (section) => (section as HTMLElement).dataset.section,
        ),
      })),
    );
  const gaps = () =>
    page
      .locator('.site-section-groups > *')
      .evaluateAll((elements) =>
        elements
          .slice(1)
          .map((element, index) =>
            Math.round(
              element.getBoundingClientRect().top - elements[index].getBoundingClientRect().bottom,
            ),
          ),
      );
  await page.goto(`${siteDevUrl}/components/scaffold`);
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview', 'variants', 'anatomy', 'behaviour'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['accessibility'] },
    { group: true, sections: ['related'] },
  ]);
  expect(new Set(await gaps()).size).toBe(1);
  // Box has no Variants, Anatomy or Behaviour, and its Accessibility holds only the lists that
  // are in the Docs, so the catalogue has no group after its Rules.
  await goTo(page, '/components/box');
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['related'] },
  ]);
  // A page with every group: what it is, its variants, parts and behaviour; its rules, which
  // open with Use it when; its accessibility.
  await goTo(page, '/components/button');
  await expect.poll(groups).toEqual([
    { group: true, sections: ['overview', 'variants', 'anatomy', 'behaviour'] },
    { group: true, sections: ['rules'] },
    { group: true, sections: ['accessibility'] },
    { group: true, sections: ['related'] },
  ]);
  expect(new Set(await gaps()).size).toBe(1);
  // Its Use it when list of six runs in two columns of three where there is room, one when narrow.
  const columns = () =>
    page.locator('[data-section="rules"] .catalogue-when-columns ul').evaluate((list) => ({
      columns: getComputedStyle(list).gridTemplateColumns.split(' ').length,
      tops: new Set([...list.children].map((item) => Math.round(item.getBoundingClientRect().top)))
        .size,
    }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(columns).toEqual({ columns: 2, tops: 3 });
  await page.setViewportSize({ width: 420, height: 900 });
  await expect.poll(columns).toEqual({ columns: 1, tops: 6 });
});

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

test('the page of all foundations is one sheet, each pane a single link to its foundation', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/foundations`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foundations');
  const panes = page.locator('.catalogue-foundation-sheet').getByRole('link');
  const foundations = pagesOf('catalogue').filter((entry) => entry.kind === 'foundation');
  await expect(panes).toHaveCount(foundations.length);
  for (const foundation of foundations) {
    // One link a pane, named by its heading, with nothing else to use inside it.
    const pane = panes.filter({ has: page.getByRole('heading', { name: foundation.title }) });
    await expect(pane).toHaveAccessibleName(foundation.title);
    await expect(pane).toHaveAttribute('href', `/${foundation.path}`);
    await expect(pane.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0);
  }
  // The whole pane leads there, its picture as well as its name.
  const icons = panes.filter({ has: page.getByRole('heading', { name: 'Icons' }) });
  await expect(icons).toHaveCSS('cursor', 'pointer');
  await icons.scrollIntoViewIfNeeded();
  const box = (await icons.boundingBox())!;
  await page.mouse.click(box.x + 8, box.y + box.height - 8);
  await expect(page).toHaveURL(`${siteDevUrl}/foundations/icons`);
});

test('a Related tile of a page without an example shows its specimen', async ({ page }) => {
  // Icon is documented on the Icons foundation's page, which has no example: its tile links there
  // and shows a few of the icons, fitted to its stage as an example is.
  await page.goto(`${siteDevUrl}/components/avatar`);
  const tile = page.locator('.catalogue-related-tile').filter({ hasText: /^Icon/ });
  await tile.scrollIntoViewIfNeeded();
  await expect(tile.getByRole('link', { name: 'Icon', exact: true })).toHaveAttribute(
    'href',
    '/foundations/icons',
  );
  await expect(tile.locator('.catalogue-related-stage')).toHaveAttribute(
    'data-catalogue-specimen',
    'icons',
  );
  await expect(tile.locator('.catalogue-related-canvas[data-fitted] svg')).toHaveCount(6);
  await expect(page.locator('.catalogue-related-placeholder')).toHaveCount(0);
});

test('every tile of the galleries is fitted: components at one scale, a scene at about its own size', async ({
  page,
}) => {
  // A tile's example loads as it nears the viewport and comes into its canvas after the fit has
  // started to watch it; each must still be fitted. Components show at one scale, their own size
  // where the stage has room, cut off by it where they are larger; a pattern's scene, on its
  // larger card, at about its own size, so its words read as a page's do (Gallery.css), cut off by
  // its stage where it is larger; a drawing shows what it holds inside its stage.
  const tiles = page.locator('.catalogue-gallery-tile');
  const unfitted = () =>
    tiles.evaluateAll((items) => {
      // The one scale every component's tile is drawn at: its own size where the stage has
      // room for the tiles' window, else smaller.
      const scaleOf = (canvas: Element | null) =>
        (canvas as HTMLElement | null)?.style.transform.match(/scale\(([^)]+)\)/)?.[1];
      const one = items
        .map((tile) =>
          scaleOf(tile.querySelector('[data-own-size][data-fitted]:not([data-popup])')),
        )
        .find(Boolean);
      return items.flatMap((tile) => {
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent ?? '';
        const stage = tile.querySelector('.catalogue-related-stage')!.getBoundingClientRect();
        const canvas = tile.querySelector<HTMLElement>('.catalogue-related-canvas[data-fitted]');
        if (!canvas || !/scale\(/.test(canvas.style.transform)) return [`${name}: not fitted`];
        // What shows, as the fit measures it (Related.tsx): what paints something of its own,
        // a fill, an edge, a shadow, text or a picture, and not a visually hidden pixel, such as
        // a form's input; a box that only lays out others, such as an avatar group's room to
        // spread, shows nothing.
        const window = canvas.getBoundingClientRect();
        const scale = window.width / canvas.offsetWidth;
        const clear = (color: string) =>
          color === 'transparent' || /rgba\([^)]*,\s*0\)$|\/\s*0\)$/.test(color);
        const paints = (element: Element) => {
          if (/^(img|svg|canvas|video|input|textarea|select|hr)$/i.test(element.localName))
            return true;
          const style = getComputedStyle(element);
          if (style.opacity === '0') return false;
          // Clipped away whole, as a visually hidden announcer is, or inside what is.
          for (
            let node: Element | null = element;
            node && node !== canvas;
            node = node.parentElement
          )
            if (/^inset\((50|100)%/.test(getComputedStyle(node).clipPath)) return false;
          if (!clear(style.backgroundColor) || style.backgroundImage !== 'none') return true;
          if (style.boxShadow !== 'none') return true;
          if (
            ['top', 'right', 'bottom', 'left'].some(
              (side) =>
                parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
                style.getPropertyValue(`border-${side}-style`) !== 'none' &&
                !clear(style.getPropertyValue(`border-${side}-color`)),
            )
          )
            return true;
          return [...element.childNodes].some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          );
        };
        // A box shows only as far as the boxes around it that clip show it, such as a scrolling
        // list's rows or a closed panel's content.
        const clipped = (element: Element) => {
          let box = element.getBoundingClientRect();
          for (
            let node = element.parentElement;
            node && node !== canvas;
            node = node.parentElement
          ) {
            const style = getComputedStyle(node);
            if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
            const clip = node.getBoundingClientRect();
            const left = Math.max(box.left, clip.left);
            const top = Math.max(box.top, clip.top);
            box = new DOMRect(
              left,
              top,
              Math.max(0, Math.min(box.right, clip.right) - left),
              Math.max(0, Math.min(box.bottom, clip.bottom) - top),
            );
          }
          return box;
        };
        const shown = [...canvas.querySelectorAll('*')]
          .filter((element) => element.checkVisibility({ visibilityProperty: true }))
          .filter((element) => !element.closest('svg') || element.localName === 'svg')
          .filter(paints)
          .map(clipped)
          .filter((box) => box.width > scale && box.height > scale)
          .filter((box) => box.width < window.width - 1 || box.height < window.height - 1);
        if (!shown.length) return [`${name}: empty`];
        // A popup shown open is drawn as its tile is: in a component's, at the one scale or at
        // the least a component's popup is drawn at, never between, whole or a window onto it from
        // its top; in a scene, at about its own size, as the scene is, so its words read as the
        // other tiles' do (Gallery.css). An overlay, such as a notification or a dialog, is drawn at
        // the overlays' one scale, or on a phone smaller only where it shows whole no larger, down
        // to its window's least (Tiles.ts).
        if (canvas.hasAttribute('data-popup')) {
          const at = Number(scaleOf(canvas));
          const own = canvas.hasAttribute('data-own-size');
          const style = getComputedStyle(canvas);
          const overlay = canvas.hasAttribute('data-overlay')
            ? parseFloat(style.getPropertyValue('--catalogue-overlay-scale'))
            : 0;
          const popupLeast = parseFloat(style.getPropertyValue('--catalogue-own-popup-least'));
          const near = (scale: number) => Math.abs(at - scale) <= 0.001;
          if (!own)
            return at >= 0.95 - 0.001 && at <= 1.001 ? [] : [`${name}: popup drawn at ${at}`];
          if (overlay)
            return near(overlay) || (at < overlay && at >= popupLeast - 0.001)
              ? []
              : [`${name}: overlay drawn at ${at}`];
          // A modal that isn't one of the overlays, such as a dialog with a field, is drawn as
          // large as shows it whole, down to its window's least.
          if (canvas.querySelector('.env-dialog-backdrop'))
            return at >= popupLeast - 0.001 && at <= Number(one ?? 1) + 0.001
              ? []
              : [`${name}: modal drawn at ${at}`];
          return near(Number(one ?? 1)) || near(popupLeast)
            ? []
            : [`${name}: popup drawn at ${at}`];
        }
        if (canvas.hasAttribute('data-own-size'))
          return scaleOf(canvas) === one && Number(one) <= 1 ? [] : [`${name}: not at one scale`];
        if (canvas.parentElement?.classList.contains('catalogue-related-crop'))
          return Number(scaleOf(canvas)) >= 0.95 ? [] : [`${name}: too small to read`];
        const outside =
          Math.min(...shown.map((box) => box.left)) < stage.left - 1 ||
          Math.min(...shown.map((box) => box.top)) < stage.top - 1 ||
          Math.max(...shown.map((box) => box.right)) > stage.right + 1 ||
          Math.max(...shown.map((box) => box.bottom)) > stage.bottom + 1;
        return outside ? [`${name}: clipped`] : [];
      });
    });
  for (const route of ['/components', '/patterns']) {
    await page.goto(`${siteDevUrl}${route}`);
    await expect(tiles.first()).toBeVisible();
    const count = await tiles.count();
    expect(count).toBeGreaterThan(route === '/components' ? 60 : 10);
    for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(unfitted, { message: route }).toEqual([]);
    // A picture cut off at its foot is never cut through a row: each row of a menu, a list, a
    // table or a tree that reaches past the foot fades out there, under a fade of at least half a
    // rem, rather than ending in a slice through it.
    const cutRows = await tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const canvas = tile.querySelector('.catalogue-related-canvas[data-cut~="bottom"]');
        if (!canvas) return [];
        const stage = tile.querySelector('.catalogue-related-stage')!.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const length = getComputedStyle(canvas.parentElement!)
          .getPropertyValue('--catalogue-crop-bottom')
          .trim();
        const fade = parseFloat(length) * (length.endsWith('rem') ? rem : 1);
        if (fade >= rem / 2) return [];
        const rows = "[role^='menuitem'], [role='option'], [role='row'], [role='treeitem'], li, tr";
        return [...canvas.querySelectorAll(rows)]
          .filter((row) => !row.querySelector(rows))
          .filter((row) => row.checkVisibility({ visibilityProperty: true }))
          .filter((row) => {
            const box = row.getBoundingClientRect();
            return box.top < stage.bottom && box.bottom > stage.bottom + 2;
          })
          .map(
            (row) =>
              `${tile.querySelector('.catalogue-gallery-name')?.textContent}: ${row.textContent}`,
          );
      }),
    );
    expect(cutRows, route).toEqual([]);
    // A popup shown open, such as a menu beside its button or a dialog, shows its top and its
    // start in its stage, its corners there in view. Where it is larger, it is a window onto it,
    // cut off at its foot or its end, fading out there, after a whole row (above); a modal taller
    // than its stage's screen, framed down it on what its script acts on, at its top too.
    const cutPopups = await tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const stage = tile.querySelector('.catalogue-related-stage')!.getBoundingClientRect();
        const layer = tile.querySelector('.catalogue-overlay-layer');
        if (!layer) return [];
        const cut = tile.querySelector<HTMLElement>('.catalogue-related-canvas')?.dataset.cut ?? '';
        // A card: the outermost popup or dialog, such as a menu, a palette or a hover card.
        const card =
          ".env-popup, [role='menu'], [role='dialog'], [role='alertdialog'], [role='tooltip']";
        const cards = [...layer.querySelectorAll<HTMLElement>(card)]
          .filter((element) => !element.parentElement?.closest(card))
          .filter((element) => element.checkVisibility());
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent;
        return cards
          .filter((card) => {
            const box = card.getBoundingClientRect();
            return (
              box.left < stage.left - 1 ||
              (box.top < stage.top - 1 && !cut.includes('top')) ||
              (box.right > stage.right + 1 && !cut.includes('end')) ||
              (box.bottom > stage.bottom + 1 && !cut.includes('bottom'))
            );
          })
          .map((card) => `${name}: ${card.className}`);
      }),
    );
    expect(cutPopups, route).toEqual([]);
  }
});

test('on a phone, no gallery tile breaks a word across lines', async ({ page }) => {
  // Each component lays out as wide as it is written for, such as a notification at its own width,
  // and is drawn smaller to fit its stage, rather than squeezed until a word breaks mid-way.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${siteDevUrl}/components`);
  const tiles = page.locator('.catalogue-gallery-tile');
  await expect(tiles.first()).toBeVisible();
  const count = await tiles.count();
  for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
  const broken = () =>
    tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const canvas = tile.querySelector('.catalogue-related-canvas[data-fitted]');
        if (!canvas) return [`${tile.textContent}: not fitted`];
        const name = tile.querySelector('.catalogue-gallery-name')?.textContent;
        const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT);
        const found: string[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.parentElement?.checkVisibility({ visibilityProperty: true })) continue;
          for (const word of node.textContent!.matchAll(/\S{2,}/g)) {
            const range = document.createRange();
            range.setStart(node, word.index);
            range.setEnd(node, word.index + word[0].length);
            // The lines a word's boxes stand on: more than one where it breaks.
            const lines = new Set(
              [...range.getClientRects()]
                .filter((box) => box.width > 0)
                .map((box) => Math.round(box.bottom)),
            );
            if (lines.size > 1) found.push(`${name}: ${word[0]}`);
          }
        }
        return found;
      }),
    );
  await expect.poll(broken).toEqual([]);
});

/** A gallery tile's view: the translate and scale its canvas is drawn at (useFit.ts). */
const viewOf = (canvas: Element) => {
  const [, x, y, scale] =
    (canvas as HTMLElement).style.transform.match(
      /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\)/,
    ) ?? [];
  return { x: Number(x), y: Number(y), scale: Number(scale) };
};

type PlayFrame = {
  time: number;
  view: { x: number; y: number; scale: number };
  cut: string;
  past: Record<string, number>;
  popups: Record<string, number>[];
};

/**
 * Hovers a gallery tile from rest for `duration` ms and records each frame of its play: its view,
 * where it is cut off, how far what `targets` select reaches past the stage's edges, and how far
 * each popup it opens does. Then rests it, back at its still's scale.
 */
async function playTile(page: Page, name: string, targets: string[], duration = 4500) {
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
  });
  const canvas = tile.locator('.catalogue-related-canvas[data-fitted]');
  await tile.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(tile.locator('[data-playing]')).toHaveCount(0);
  const rest = await canvas.evaluate(viewOf);
  await tile.evaluate((element, targets) => {
    // As viewOf reads it, in the page.
    const view = (canvas: HTMLElement) => {
      const [, x, y, scale] =
        canvas.style.transform.match(
          /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\)/,
        ) ?? [];
      return { x: Number(x), y: Number(y), scale: Number(scale) };
    };
    const frames: PlayFrame[] = [];
    (element as HTMLElement & { frames?: PlayFrame[] }).frames = frames;
    const stage = element.querySelector('.catalogue-related-stage')!;
    const start = performance.now();
    const reach = (boxes: DOMRect[]) => {
      const edge = stage.getBoundingClientRect();
      return {
        top: edge.top - Math.min(...boxes.map((box) => box.top)),
        start: edge.left - Math.min(...boxes.map((box) => box.left)),
        end: Math.max(...boxes.map((box) => box.right)) - edge.right,
        bottom: Math.max(...boxes.map((box) => box.bottom)) - edge.bottom,
      };
    };
    const card = ".env-popup, [role='menu'], [role='dialog'], [role='alertdialog']";
    // What the still showed open, drawn as it rests, such as a dialog cut off at its foot: what
    // opens as it plays is judged.
    const rested = new Set(element.querySelectorAll('.catalogue-overlay-layer *'));
    const sample = () => {
      const canvas = element.querySelector<HTMLElement>('.catalogue-related-canvas');
      if (canvas && element.querySelector('[data-playing]')) {
        // What shows of each, as a scrolled row doesn't.
        const boxes = targets
          .flatMap((selector) => [...canvas.querySelectorAll(selector)])
          .filter((node) => node.checkVisibility({ opacityProperty: true }))
          .map((node) => node.getBoundingClientRect())
          .filter((box) => box.width > 1 && box.height > 1);
        // Each popup that opened and shows, but on its way in or out.
        const popups = [...canvas.querySelectorAll('.catalogue-overlay-layer *')]
          .filter((node) => !rested.has(node))
          .filter((node) => node.matches(card) && !node.parentElement?.closest(card))
          .filter((node) => node.checkVisibility({ opacityProperty: true }))
          .filter((node) => !node.closest('[data-starting-style], [data-ending-style]'))
          .filter((node) => !node.getAnimations().length)
          .map((node) => reach([node.getBoundingClientRect()]));
        frames.push({
          time: performance.now() - start,
          view: view(canvas),
          cut: canvas.dataset.cut ?? '',
          past: boxes.length ? reach(boxes) : { top: 0, start: 0, end: 0, bottom: 0 },
          popups,
        });
      }
      if (element.isConnected) requestAnimationFrame(sample);
    };
    sample();
  }, targets);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await expect(tile.locator('[data-playing]')).toHaveCount(1);
  await page.waitForTimeout(duration);
  const frames = await tile.evaluate((element) =>
    (element as HTMLElement & { frames: PlayFrame[] }).frames.splice(0),
  );
  await page.mouse.move(0, 0);
  // About its still's scale: a popup shown open at rest, placed against the window's edge, may
  // come to rest a hair from where it was.
  await expect
    .poll(async () => Math.abs((await canvas.evaluate(viewOf)).scale - rest.scale), {
      message: name,
    })
    .toBeLessThan(0.005);
  // And has come to a stop there.
  await expect
    .poll(() =>
      canvas.evaluate(
        (element) =>
          new Promise<boolean>((resolve) => {
            const { transform } = (element as HTMLElement).style;
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                resolve((element as HTMLElement).style.transform === transform),
              ),
            );
          }),
      ),
    )
    .toBe(true);
  return { rest, frames };
}

/**
 * Frames whose view holds for 300 ms either side: where it is drawn, not on its way there, nor in
 * the frame or two a popup shows before the view follows it.
 */
const heldFrames = (frames: PlayFrame[]) =>
  frames.filter((frame) =>
    frames
      .filter(({ time }) => Math.abs(time - frame.time) <= 300)
      .every(
        ({ view }) =>
          view.scale === frame.view.scale &&
          Math.abs(view.x - frame.view.x) < 0.5 &&
          Math.abs(view.y - frame.view.y) < 0.5,
      ),
  );

test("a gallery tile that plays draws out what it opens inside its stage and rests at its still's scale", async ({
  page,
}) => {
  // As a tile plays, its view stays at its still until what its script opens needs more room:
  // then it is drawn out about its trigger, no smaller than a popup's least scale (Gallery.css),
  // and holds there: its scale only falls. Played again, it does the same. A menu closed and
  // opened again from its button keeps its items and its button in view.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const least = 0.84;
  // What each script acts on, by the selectors of its tile (tiles/).
  const cards = {
    Menu: ['.env-menu-item', '.env-button'],
  };
  for (const [name, targets] of Object.entries(cards)) {
    const { rest, frames: first } = await playTile(page, name, targets);
    expect(first.length, name).toBeGreaterThan(20);
    const floor = Math.min(rest.scale, least);
    const outside = heldFrames(first)
      .filter(({ time }) => time > 900)
      .flatMap(({ view: { scale }, past }) => [
        ...(scale < floor - 0.001 ? [`drawn at ${scale}`] : []),
        ...Object.entries(past).flatMap(([side, by]) =>
          by > 1 ? [`${side} ${by} at ${scale}`] : [],
        ),
      ]);
    expect([...new Set(outside)], name).toEqual([]);
    // Drawn out, it is drawn no larger again until it rests.
    const grows = first.filter(
      (frame, index) => index > 0 && frame.view.scale > first[index - 1]!.view.scale,
    );
    expect(grows, name).toEqual([]);
    // Played again, it does the same: it starts at its still and is drawn out as far.
    const { frames: again } = await playTile(page, name, targets);
    expect(again[0]!.view.scale, name).toBeCloseTo(rest.scale, 2);
    expect(again.at(-1)!.view.scale, name).toBeCloseTo(first.at(-1)!.view.scale, 3);
  }
});

test('a popup tile rests open and holds one view from its still through its play', async ({
  page,
}) => {
  // A select, a combobox, a menu bar and a command palette rest with their popup open, framed on
  // it whole; as they play, the list closes and opens again in place, and nothing is drawn smaller
  // or moved (useHeldView, Motion.tsx). So does the avatar pile as its tooltip opens.
  test.setTimeout(120_000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto(`${siteDevUrl}/components`);
    for (const name of ['Select', 'Combobox', 'Menubar', 'CommandPalette', 'Avatar']) {
      const tile = page.locator('.catalogue-gallery-tile').filter({
        has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
      });
      await tile.scrollIntoViewIfNeeded();
      // At rest, the popup shows open, cut off nowhere; on a phone, where it is larger than the
      // stage at a popup's least, it runs on past the stage's foot or end, fading out there,
      // rather than being drawn smaller, never past its top or start.
      if (name !== 'Avatar') {
        await expect(
          tile
            .locator('.catalogue-overlay-layer')
            .locator('.env-popup, .env-command-palette')
            .first(),
          name,
        ).toBeVisible();
        await expect(
          tile.locator('.catalogue-related-canvas[data-fitted]'),
          name,
        ).not.toHaveAttribute('data-cut', width === 390 ? /top|start/ : /./);
      }
      const { rest, frames } = await playTile(page, name, [], 4500);
      expect(frames.length, name).toBeGreaterThan(20);
      const moved = frames
        .filter(
          ({ view }) =>
            Math.abs(view.scale - rest.scale) > 0.0005 ||
            Math.abs(view.x - rest.x) > 0.5 ||
            Math.abs(view.y - rest.y) > 0.5,
        )
        .map(({ time, view }) => `${Math.round(time)}: ${JSON.stringify(view)}`);
      expect(moved, `${name} at ${width}`).toEqual([]);
    }
  }
});

test('the gallery renders its tiles ahead of the scroll, before they come into view', async ({
  page,
}) => {
  // The page scrolls inside the scaffold's body: a tile below the fold is drawn by the time it is
  // scrolled to, rather than fading in as it comes into view (useNear, Related.tsx).
  for (const route of ['/components', '/patterns']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${siteDevUrl}${route}`);
    await expect(page.locator('.catalogue-related-canvas[data-fitted]').first()).toBeVisible();
    // The tiles whose stage starts within a screen below the fold, unscrolled.
    const below = () =>
      page.locator('.catalogue-gallery-tile').evaluateAll((tiles) =>
        tiles
          .filter((tile) => {
            const { top } = tile.getBoundingClientRect();
            return top > innerHeight && top < innerHeight + 400;
          })
          .map((tile) => Boolean(tile.querySelector('.catalogue-related-canvas[data-fitted]'))),
      );
    expect((await below()).length, route).toBeGreaterThan(0);
    await expect.poll(async () => (await below()).every(Boolean), { message: route }).toBe(true);
  }
});

test('a gallery tile holds its still as the pointer comes in', async ({ page }) => {
  // The first thing seen as a tile starts to play is what its script does, not the tile moving.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  // Its still is framed as its play is (useFit.ts): Accordion's panel opens in place.
  for (const name of ['Tree', 'List', 'Avatar', 'Accordion']) {
    // Just past 300 ms, the first stretch of the play.
    const { rest, frames } = await playTile(page, name, [], 400);
    const moved = frames
      .filter(({ time }) => time <= 300)
      .filter(
        ({ view }) =>
          view.scale !== rest.scale ||
          Math.abs(view.x - rest.x) > 0.5 ||
          Math.abs(view.y - rest.y) > 0.5,
      );
    expect(moved, name).toEqual([]);
  }
});

/**
 * In the page: waits until every gallery tile whose stage shows whole has been still for half a
 * second, then reads each one's view over 60 frames, and again after the page scrolls a little.
 * A popup is placed against the stage's and the window's edges, so a view that followed it each
 * time would never stop (holdsFrame, useFit.ts).
 */
const stillTiles = (page: Page, from: number) =>
  page.evaluate(async (from) => {
    const frame = () => new Promise(requestAnimationFrame);
    const tiles = [...document.querySelectorAll<HTMLElement>('.catalogue-gallery-tile')];
    const whole = () =>
      tiles.filter((tile) => {
        const box = tile.querySelector('.catalogue-related-stage')!.getBoundingClientRect();
        return (
          box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth
        );
      });
    const nameOf = (tile: Element) => tile.querySelector('.catalogue-gallery-name')!.textContent!;
    const viewOf = (tile: Element) =>
      tile.querySelector<HTMLElement>('.catalogue-related-canvas[data-fitted]')?.style.transform;
    tiles[from]!.scrollIntoView({ block: 'start' });
    const shown = whole();
    // Still for 30 frames running, within four seconds.
    let calm = 0;
    let last = shown.map(viewOf).join();
    for (const start = performance.now(); calm < 30 && performance.now() - start < 4000; ) {
      await frame();
      const now = shown.map(viewOf).join();
      calm = now === last && !now.includes(',,') && shown.every(viewOf) ? calm + 1 : 0;
      last = now;
    }
    const seen = shown.map((tile) => new Set([viewOf(tile)]));
    for (let count = 0; count < 60; count++) {
      await frame();
      shown.forEach((tile, index) => seen[index]!.add(viewOf(tile)));
    }
    const moving = shown.flatMap((tile, index) =>
      seen[index]!.size > 1
        ? [`${nameOf(tile)}: ${[...seen[index]!].slice(0, 3).join(' | ')}`]
        : [],
    );
    // Scrolled a little, each tile that still shows whole holds its view.
    const views = new Map(shown.map((tile) => [tile, viewOf(tile)]));
    let scroller: HTMLElement | null = tiles[from]!;
    while (
      scroller &&
      !(
        scroller.scrollHeight > scroller.clientHeight + 1 &&
        /auto|scroll/.test(getComputedStyle(scroller).overflowY)
      )
    )
      scroller = scroller.parentElement;
    scroller?.scrollBy(0, 60);
    for (let count = 0; count < 30; count++) await frame();
    const reframed = whole()
      .filter((tile) => views.has(tile) && views.get(tile) !== viewOf(tile))
      .map((tile) => `${nameOf(tile)}: ${views.get(tile)} → ${viewOf(tile)}`);
    return {
      moving,
      reframed,
      next: Math.max(from + 1, ...shown.map((tile) => tiles.indexOf(tile) + 1)),
      count: tiles.length,
    };
  }, from);

for (const [width, scale] of [
  [1280, 1.5],
  [1536, 1.25],
  [1920, 1],
] as const)
  test.describe(`at ${width} px wide, ${scale} device px to a px`, () => {
    test.use({ viewport: { width, height: 864 }, deviceScaleFactor: scale });
    test('every gallery tile at rest holds still, also as the page scrolls', async ({ page }) => {
      // Such as a menu bar resting with its menu open: the view eases to its frame and stops,
      // rather than following its popup as it is placed again a fraction away, every frame.
      test.setTimeout(240_000);
      for (const route of ['/components', '/patterns']) {
        await page.goto(`${siteDevUrl}${route}`);
        await page.mouse.move(0, 0);
        await expect(page.locator('.catalogue-related-canvas[data-fitted]').first()).toBeVisible();
        const moving: string[] = [];
        const reframed: string[] = [];
        for (let from = 0, count = 1; from < count; ) {
          const found = await stillTiles(page, from);
          moving.push(...found.moving);
          reframed.push(...found.reframed);
          ({ next: from, count } = found);
        }
        expect(moving, `${route}: tiles that never hold still`).toEqual([]);
        expect(reframed, `${route}: tiles framed again as the page scrolls`).toEqual([]);
      }
    });
  });

test('a tile that holds its view is framed the same wherever the pointer comes in', async ({
  page,
}) => {
  // Framed at rest on its largest state, such as the avatar pile in the row it spreads into, it
  // shows the same frame from its still through its play and back, whether the pointer comes in at
  // the stage's middle or its corner, and the pile's count and its tooltip show whole.
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  await expect(page.locator('.catalogue-related-canvas[data-fitted]').first()).toBeVisible();
  for (const name of [
    'Avatar',
    'Menu',
    'Select',
    'Combobox',
    'Menubar',
    'CommandPalette',
    'MonthPicker',
    'TimePicker',
  ]) {
    const tile = page.locator('.catalogue-gallery-tile').filter({
      has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
    });
    const canvas = tile.locator('.catalogue-related-canvas[data-fitted]');
    await tile.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(canvas).toHaveCount(1);
    const still = () =>
      canvas.evaluate(
        (element: HTMLElement) =>
          new Promise<string>((resolve) => {
            const { transform } = element.style;
            let frames = 20;
            const next = () => {
              if (element.style.transform !== transform) resolve('');
              else if (--frames) requestAnimationFrame(next);
              else resolve(transform);
            };
            requestAnimationFrame(next);
          }),
      );
    await expect.poll(still, { message: name }).not.toBe('');
    const rest = await still();
    for (const [x, y] of [
      [0.5, 0.4],
      [0.97, 0.7],
    ] as const) {
      await tile.scrollIntoViewIfNeeded();
      const box = (await tile.locator('.catalogue-related-stage').boundingBox())!;
      await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
      await expect(tile.locator('[data-playing]')).toHaveCount(1);
      const { views, cut } = await tile.evaluate(
        (element, name) =>
          new Promise<{ views: string[]; cut: string[] }>((resolve) => {
            const canvas = element.querySelector<HTMLElement>('.catalogue-related-canvas')!;
            const stage = element
              .querySelector('.catalogue-related-stage')!
              .getBoundingClientRect();
            const views = new Set<string>();
            const cut = new Set<string>();
            const start = performance.now();
            const sample = () => {
              views.add(canvas.style.transform);
              // The pile's avatars, its count and its tooltip, whole in the stage, and the row the
              // pile spreads into across its middle.
              const row = canvas.querySelector('.env-avatar-group')?.getBoundingClientRect();
              if (row && Math.abs((row.left + row.right) / 2 - (stage.left + stage.right) / 2) > 2)
                cut.add('off the middle');
              if (name === 'Avatar')
                for (const part of canvas.querySelectorAll(
                  '.env-avatar-group > *, .catalogue-overlay-layer .env-tooltip',
                )) {
                  const box = part.getBoundingClientRect();
                  if (
                    part.checkVisibility({ opacityProperty: true }) &&
                    (box.left < stage.left - 0.5 ||
                      box.right > stage.right + 0.5 ||
                      box.top < stage.top - 0.5 ||
                      box.bottom > stage.bottom + 0.5)
                  )
                    cut.add(part.className);
                }
              if (performance.now() - start < 2200) requestAnimationFrame(sample);
              else resolve({ views: [...views], cut: [...cut] });
            };
            sample();
          }),
        name,
      );
      expect(views, `${name}, the pointer in at ${x}, ${y}`).toEqual([rest]);
      expect(cut, `${name}, the pointer in at ${x}, ${y}`).toEqual([]);
      await page.mouse.move(0, 0);
      await expect(tile.locator('[data-playing]')).toHaveCount(0);
      await expect.poll(still, { message: `${name} rests again` }).toBe(rest);
    }
  }
});

test('on a phone, what a playing gallery tile opens shows inside its stage', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${siteDevUrl}/components`);
  for (const name of ['Menubar', 'Select']) {
    const { frames } = await playTile(page, name, []);
    // Past an edge it is cut off at, such as the menu bar's menu at the stage's end, it fades out.
    const outside = heldFrames(frames).flatMap(({ time, popups, cut }) =>
      popups.flatMap((popup) =>
        Object.entries(popup).flatMap(([side, by]) =>
          by > 1 && !cut.split(' ').includes(side)
            ? [`${side} ${Math.round(by)} at ${Math.round(time)}`]
            : [],
        ),
      ),
    );
    expect(outside, name).toEqual([]);
  }
  // A dialog taller than its stage shows from its top, and the view pans down it to what the
  // script presses, so each press lands on what it aims at (useFit.ts).
  expect(await deadClicks(page, ['Dialog', 'ConfirmDialog'])).toEqual([]);
});

test('figures with open overlays keep them in their stages, overviews live and others inert, and leave the page alone', async ({
  page,
}) => {
  test.slow();
  const pages = componentDocuments
    .filter((document) =>
      (document.outline ?? []).some((section) => section.examples.some((example) => example.open)),
    )
    .map(({ id }) => id);
  expect(pages).toEqual(expect.arrayContaining(['dialog', 'menu', 'tooltip', 'toast', 'select']));
  await page.goto(`${siteDevUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    const rooms = page.locator('.catalogue-open-example');
    await expect(rooms.first()).toBeVisible();
    await expect(page.locator('.site-loading')).toHaveCount(0);
    // Every open figure shows an overlay, inside its stage. The Overview's is the component at
    // rest, open, which people can use; any other is a picture: inert.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            [...document.querySelectorAll<HTMLElement>('.catalogue-open-example')].flatMap(
              (room) => {
                const stage = room
                  .closest('.site-live-example, .site-verdict-stage, .site-anatomy-stage')!
                  .getBoundingClientRect();
                const surfaces = [
                  ...room.querySelectorAll(
                    '.env-popup, .env-dialog, .env-sheet, .env-command-palette, .env-toast',
                  ),
                ];
                const name = room.dataset.openExample;
                const overview = !!room.closest('[data-section="overview"]');
                if (overview && room.inert) return [`${name}, an overview, is inert`];
                if (!overview && !room.inert) return [`${name} is not inert`];
                if (!surfaces.length) return [`${name} shows no overlay`];
                return surfaces
                  .map((surface) => surface.getBoundingClientRect())
                  .filter(
                    (box) =>
                      box.left < stage.left - 1 ||
                      box.right > stage.right + 1 ||
                      box.top < stage.top - 1 ||
                      box.bottom > stage.bottom + 1,
                  )
                  .map(() => `${name} reaches past its stage`);
              },
            ),
          ),
        { message: `${id}: open figures` },
      )
      .toEqual([]);
    // No figure took focus or locked the page.
    expect(
      await page.evaluate(() => ({
        focusInFigure: !!document.activeElement?.closest('.catalogue-open-example'),
        locked: [document.documentElement, document.body].some(
          (element) => getComputedStyle(element).overflow === 'hidden',
        ),
        hidden: !!document.querySelector('main [aria-hidden="true"] .site-figures'),
      })),
      id,
    ).toEqual({ focusInFigure: false, locked: false, hidden: false });
  }
  // The page still scrolls with the wheel.
  const scroller = page.locator('.env-scaffold-body');
  const before = await scroller.evaluate((element) => element.scrollTop);
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).not.toBe(before);
});

test("an overlay's overview rests open, and people can close it and open it again", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/dialog`);
  const room = page.locator('[data-section="overview"] .catalogue-open-example').first();
  const dialog = room.locator('.env-dialog');
  // Open as the page loads, without taking focus.
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await room.getByRole('button', { name: 'View project', exact: true }).click();
  await expect(dialog).toBeVisible();
  // A select's list takes the pointer too, and its choice sticks.
  await page.goto(`${siteDevUrl}/components/select`);
  const select = page.locator('[data-section="overview"] .catalogue-open-example').first();
  await select.getByRole('option', { name: 'Private', exact: true }).click();
  await expect(select.locator('.env-select-trigger')).toContainText('Private');
});

test("F6 passes the figures' notifications by, to the browser @engines", async ({ page }) => {
  await page.goto(`${siteDevUrl}/components/toast`);
  await expect(page.locator('.catalogue-open-example .env-toast').first()).toBeVisible();
  // While no notification of the page is open, F6 is the browser's: the figures' notices, which
  // are pictures, don't take it.
  await page.evaluate(() =>
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F6') document.body.dataset.f6Prevented = String(event.defaultPrevented);
    }),
  );
  await page.keyboard.press('F6');
  await expect(page.locator('body')).toHaveAttribute('data-f6-prevented', 'false');
  // Every catalogue figure that raises a notice plays it or shows it as a picture, so none is
  // live; F6 reaching a live notice is Toast's own (Toast.spec.ts).
});

/**
 * What a gallery tile shows that a click can change, as one string: each element's name, its
 * states and its own text, and a field's value, but not what the pointer marks as it hovers and
 * presses, nor what the fit sets as the view moves (useFit.ts).
 */
function tileState(canvas: Element) {
  const states = [
    'aria-current',
    'aria-checked',
    'aria-selected',
    'aria-expanded',
    'aria-pressed',
    'aria-hidden',
    'data-checked',
    'data-selected',
    'data-current',
    'data-open',
    'data-state',
    'data-catalogue-focus',
    'hidden',
    'open',
    'disabled',
  ];
  // What is selected, as the pointer's drag paints it (VirtualSelection.ts) or the page holds it.
  const highlight = (
    CSS as unknown as { highlights?: Map<string, Iterable<Range>> }
  ).highlights?.get('catalogue-selection');
  const selected = `${[...(highlight ?? [])].map(String).join('|')}|${String(getSelection())}`;
  return [...canvas.querySelectorAll('*')]
    .map((element) => {
      const own = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .join('');
      const value =
        element instanceof HTMLInputElement
          ? `=${element.value}${element.checked ? ' checked' : ''}`
          : element instanceof HTMLTextAreaElement
            ? `=${element.value}`
            : '';
      const marks = states
        .filter((name) => element.hasAttribute(name))
        .map((name) => `${name}=${element.getAttribute(name)}`)
        .join(' ');
      return `${element.localName}[${marks}]${own}${value}`;
    })
    .concat(selected)
    .join('\n');
}

/**
 * Plays a gallery's tiles one after another, each for one loop of its script, and returns, for
 * each tile whose pointer clicks, the clicks after which nothing in it changed by the time of its
 * next press or 700 ms later: a click that misses what it aims at, such as one that a box clipped
 * away takes, leaves the tile as it was.
 */
async function deadClicks(page: Page, names: string[]) {
  const dead: string[] = [];
  for (const name of names) {
    const tile = page.locator('.catalogue-gallery-tile').filter({
      has: page.locator('.catalogue-gallery-name', { hasText: new RegExp(`^${name}$`) }),
    });
    const canvas = tile.locator('.catalogue-related-canvas[data-fitted]');
    await tile.scrollIntoViewIfNeeded();
    await expect(canvas, name).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(tile.locator('[data-playing]')).toHaveCount(0);
    await canvas.evaluate((element, source) => {
      const state = new Function(`return (${source})`)() as (canvas: Element) => string;
      const log = { clicks: 0, dead: [] as string[], left: false, pressed: false };
      (element as HTMLElement & { clickLog?: typeof log }).clickLog = log;
      let before: string | null = null;
      let down = { x: 0, y: 0, time: 0 };
      let pending: { after: string; timer: number } | null = null;
      const settle = () => {
        if (!pending) return;
        window.clearTimeout(pending.timer);
        if (state(element) === before) log.dead.push(pending.after);
        pending = null;
      };
      element.addEventListener(
        'pointerdown',
        (event) => {
          if (event.isTrusted) return;
          settle();
          log.pressed = true;
          before = state(element);
          const { clientX: x, clientY: y } = event as PointerEvent;
          down = { x, y, time: performance.now() };
        },
        true,
      );
      element.addEventListener(
        'click',
        (event) => {
          if (event.isTrusted) return;
          // A click step holds the button 90 ms where it is (PointerPlan.ts); a longer press,
          // such as a card's, shows its pressed state, and a drag, such as a slider's, moves.
          const { clientX: x, clientY: y } = event as MouseEvent;
          if (performance.now() - down.time > 160 || Math.hypot(x - down.x, y - down.y) > 3) return;
          log.clicks++;
          const target = event.target as Element;
          const label =
            `${target.localName}.${[...target.classList].join('.')} ` +
            `"${target.textContent?.trim().slice(0, 20)}"`;
          pending = { after: label, timer: window.setTimeout(settle, 700) };
        },
        true,
      );
      // The script ends as its pointer leaves the preview, with no element it goes to.
      element.addEventListener(
        'pointerout',
        (event) => {
          if (!event.isTrusted && !(event as PointerEvent).relatedTarget) log.left = true;
        },
        true,
      );
    }, tileState.toString());
    const box = (await tile.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 8);
    await expect(tile.locator('[data-playing]')).toHaveCount(1);
    // One loop: until the pointer leaves, or a while for a tile whose pointer never presses.
    const started = Date.now();
    await expect
      .poll(
        () =>
          canvas.evaluate((element) => {
            const log = (element as HTMLElement & { clickLog: { left: boolean; pressed: boolean } })
              .clickLog;
            return log.left;
          }),
        { timeout: 15_000, intervals: [200] },
      )
      .toBe(true)
      .catch(() => undefined);
    if (Date.now() - started < 800) await page.waitForTimeout(800);
    await page.waitForTimeout(750);
    const log = await canvas.evaluate(
      (element) =>
        (element as HTMLElement & { clickLog: { clicks: number; dead: string[] } }).clickLog,
    );
    await page.mouse.move(0, 0);
    dead.push(...log.dead.map((click) => `${name}: ${click}`));
  }
  return dead;
}

for (const [route, parts] of [
  ['/components', 8],
  ['/patterns', 3],
] as const)
  for (let part = 0; part < parts; part++)
    test(`every click a ${route.slice(1)} gallery tile's script makes changes it (${part + 1} of ${parts})`, async ({
      page,
    }) => {
      // Each scripted click reaches what it aims at, as a person's would (VirtualPointer.ts), and
      // changes something: a value, a state, a popup opening or closing, the text it shows.
      test.setTimeout(150_000);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${siteDevUrl}${route}`);
      const tiles = page.locator('.catalogue-gallery-tile');
      await expect(tiles.first()).toBeVisible();
      const names = (await tiles.locator('.catalogue-gallery-name').allTextContents()).filter(
        (_, index) => index % parts === part,
      );
      expect(await deadClicks(page, names)).toEqual([]);
    });

test("a playing preview draws its pointer's cursor over its stage, gone at rest and when paused", async ({
  page,
}) => {
  // A gallery's card: the cursor shows on its stage while the card plays, and goes as it rests.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: /^Select$/ }),
  });
  await tile.scrollIntoViewIfNeeded();
  await expect(tile.locator('.catalogue-related-canvas[data-fitted]')).toHaveCount(1);
  const cursor = page.locator('.catalogue-pointer-cursor');
  await expect(cursor).toHaveCount(0);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  const onStage = tile.locator(
    '.catalogue-related-stage > .catalogue-pointer-layer > .catalogue-pointer-cursor',
  );
  await expect(onStage).toBeVisible();
  // Its tip is where the pointer no one sees is, inside the stage.
  const stage = (await tile.locator('.catalogue-related-stage').boundingBox())!;
  const tip = (await onStage.boundingBox())!;
  expect(tip.x).toBeGreaterThanOrEqual(stage.x - 1);
  expect(tip.x).toBeLessThanOrEqual(stage.x + stage.width);
  await page.mouse.move(0, 0);
  await expect(cursor).toHaveCount(0);
  // A page's animated figure: its cursor shows while it plays in view, and goes when it is paused.
  await page.goto(`${siteDevUrl}/components/menu`);
  const figure = page.locator('.catalogue-motion-stage').filter({
    has: page.locator('.catalogue-motion-pause'),
  });
  await figure.first().scrollIntoViewIfNeeded();
  await expect(figure.first().locator('.catalogue-pointer-cursor')).toBeVisible();
  await figure.first().hover();
  await figure.first().locator('.catalogue-motion-pause').click();
  await expect(figure.first().locator('.catalogue-pointer-cursor')).toHaveCount(0);
});

test('a playing pointer that carries a file names it in a chip beside its cursor until the drop', async ({
  page,
}) => {
  // DropZone's card carries report.pdf in, over the zone, and drops it (tiles/DropZone.tsx).
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${siteDevUrl}/components`);
  const tile = page.locator('.catalogue-gallery-tile').filter({
    has: page.locator('.catalogue-gallery-name', { hasText: /^DropZone$/ }),
  });
  await tile.scrollIntoViewIfNeeded();
  await expect(tile.locator('.catalogue-related-canvas[data-fitted]')).toHaveCount(1);
  const chip = tile.locator('.catalogue-pointer-cursor .catalogue-pointer-file');
  await expect(chip).toHaveCount(0);
  const box = (await tile.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await expect(chip).toHaveText('report.pdf');
  // Dropped, the zone uploads it, and the chip is gone while the cursor stays.
  await expect(tile.locator('.env-drop-zone')).toContainText('Uploading');
  await expect(chip).toHaveCount(0);
  await expect(tile.locator('.catalogue-pointer-cursor')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tile.locator('.catalogue-pointer-cursor')).toHaveCount(0);
});

test('each Related tile shows the component it names, also one documented on another page', async ({
  page,
}) => {
  // An export documented on another's page, such as SearchField on TextField's, shows an example
  // that renders it, not the page's lead (RelatedPages.ts).
  await page.goto(`${siteDevUrl}/components`);
  const wrong = await page.evaluate(async () => {
    // The site's own modules, as its dev server serves them.
    const load = (path: string) => import(/* @vite-ignore */ path);
    const related = (await load('/src/template/RelatedPages.ts')) as typeof RelatedPages;
    const { documents } = (await load('/src/pages/PageModel.ts')) as typeof PageModel;
    const found: string[] = [];
    for (const document of documents) {
      const full = (await load(`/src/generated/pages/${document.id}.json`).catch(() => null)) as {
        default: { metadata?: DocumentationMetadata };
      } | null;
      const metadata = full?.default.metadata;
      for (const { name, preview } of metadata?.avoidWhen ? related.alternativesOf(metadata) : []) {
        // A page's own export shows the page's tile; a pattern or a guide is no component.
        if (!related.pageOf(name) || !preview || preview.tile || preview.specimen) continue;
        const { default: source } = (await load(
          `/src/examples/${preview.page}/${preview.name}.tsx?raw`,
        )) as { default: string };
        if (!new RegExp(`<${name.replace('.', '\\.')}[\\s/>.]`).test(source))
          found.push(`${document.id}: ${name} shows ${preview.page}/${preview.name}`);
      }
    }
    return [...new Set(found)];
  });
  expect(wrong).toEqual([]);
});
