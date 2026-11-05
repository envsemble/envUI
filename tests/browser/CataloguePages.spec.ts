import { test, expect } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { chooseScheme } from './helpers/CatalogueThemes';
import { documents, componentDocuments } from '../../apps/site/src/pages/PageModel';
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
  // The install command is short and copies; under it, a line leads to the registry access it
  // needs, and the catalogue's counts sit under that.
  const code = hero.locator('.catalogue-overview-install code');
  await expect(code).toHaveText('npm i @envsemble/envui');
  await expect(code).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Copy install command' })).toBeVisible();
  await expect(hero.locator('.catalogue-overview-facts')).toContainText(
    `${componentDocuments.filter(({ id }) => id !== 'field').length} components`,
  );
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

test('every tile of the galleries is fitted: components at one scale, a scene at a legible one', async ({
  page,
}) => {
  // A tile's example loads as it nears the viewport and comes into its canvas after the fit has
  // started to watch it; each must still be fitted. Components show at one scale, their own size
  // where the stage has room, cut off by it where they are larger; a pattern's scene at a
  // legible scale, cut off by its stage where it is larger; a drawing shows what it holds inside
  // its stage.
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
        // A popup shown open, in a component's tile or a scene, is drawn at about the one scale:
        // no larger, and no smaller than the least a component's popup or a scene is drawn at,
        // or the one scale where that is smaller, so its words read as the other tiles' do
        // (Gallery.css).
        if (canvas.hasAttribute('data-popup')) {
          const at = Number(scaleOf(canvas));
          const most = Number(one ?? 1);
          const least = Math.min(most, canvas.hasAttribute('data-own-size') ? 0.84 : 0.79);
          return at >= least - 0.001 && at <= most ? [] : [`${name}: popup drawn at ${at}`];
        }
        if (canvas.hasAttribute('data-own-size'))
          return scaleOf(canvas) === one && Number(one) <= 1 ? [] : [`${name}: not at one scale`];
        if (canvas.parentElement?.classList.contains('catalogue-related-crop'))
          return Number(scaleOf(canvas)) >= 0.79 ? [] : [`${name}: too small to read`];
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
    // A picture cut off at its foot ends on a whole row: each row of a menu, a list, a table or a
    // tree that shows ends inside its stage.
    const cutRows = await tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const canvas = tile.querySelector('.catalogue-related-canvas[data-cut~="bottom"]');
        if (!canvas) return [];
        const stage = tile.querySelector('.catalogue-related-stage')!.getBoundingClientRect();
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
    // cut off at its foot or its end alone, fading out there, after a whole row (above).
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
              box.top < stage.top - 1 ||
              (box.right > stage.right + 1 && !cut.includes('end')) ||
              (box.bottom > stage.bottom + 1 && !cut.includes('bottom'))
            );
          })
          .map((card) => `${name}: ${card.className}`);
      }),
    );
    expect(cutPopups, route).toEqual([]);
    // A dialog that fits its stage, such as a confirm dialog's question and actions, is drawn
    // whole, cut off nowhere.
    if (route === '/components')
      await expect(
        page
          .locator('.catalogue-gallery-tile')
          .filter({ has: page.locator('.catalogue-gallery-name', { hasText: /^ConfirmDialog$/ }) })
          .locator('.catalogue-related-canvas[data-fitted]'),
      ).not.toHaveAttribute('data-cut', /./);
  }
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
