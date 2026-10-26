import { test, expect } from '@playwright/test';
import { siteDevUrl } from './Servers';
import { chooseScheme } from './CatalogueThemes';
import { documents, references } from '../../apps/site/src/Reference';
import { version, goTo } from './SiteSpecHelpers';

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
  // Every example shows the source of its file, ready to copy. A figure that shares its row opens
  // its code below the row, across the whole content column.
  await page
    .locator('[data-example="ButtonLinks"] ~ details summary', { hasText: 'Code' })
    .first()
    .click();
  const code = page.getByRole('region', { name: 'Code, ButtonLinks.tsx', exact: true });
  await expect(code.locator('.env-code-block')).toContainText(
    'export default function ButtonLinks',
  );
  await expect(code.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
  const widths = await code.evaluate((panel) => ({
    panel: Math.round(panel.getBoundingClientRect().width),
    column: Math.round(panel.closest('.site-figure-section')!.getBoundingClientRect().width),
  }));
  expect(widths.panel).toBe(widths.column);
  // Catalogue-only specimens, such as the forced interaction states, sit in the section they
  // illustrate.
  await expect(page.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
});

test('a component page shows plain sections, equal cells and the parts of its anatomy', async ({
  page,
}) => {
  // Wide enough for the overview's three figures to share a row beside the page's contents.
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto(`${siteDevUrl}/components/button`);
  // One page of sections, with no views; the props are on its page in the Docs, which the banner's
  // Docs opens.
  await expect(page.locator('.site-page-header').getByRole('tab')).toHaveCount(0);
  await expect(
    page.locator('.site-page-header').getByRole('link', { name: 'Docs', exact: true }),
  ).toHaveAttribute('href', '/docs/components/button');
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
  // Figures that share a row are cells of one size: equal widths, and stages as tall as the
  // tallest, once their examples have loaded.
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
          heights: new Set(stages.map((box) => Math.round(box.height))).size,
        };
      });
  await expect.poll(cells).toEqual({ count: 3, widths: 1, heights: 1 });
  // The first figure has no caption; side by side, its code lines up with its neighbours', and in
  // one column it follows its stage as closely as a caption follows theirs, with no empty band.
  const codeGaps = () =>
    page
      .locator('[data-section="overview"] .site-figure-run')
      .first()
      .evaluate((run) =>
        [...run.children].map((figure) => {
          const [stage, next] = [...figure.children].map((child) => child.getBoundingClientRect());
          const code = figure.lastElementChild!.getBoundingClientRect();
          return {
            top: Math.round(code.top - run.getBoundingClientRect().top),
            gap: Math.round(next.top - stage.bottom),
          };
        }),
      );
  const sideBySide = await codeGaps();
  expect(new Set(sideBySide.map(({ top }) => top)).size).toBe(1);
  // Do and don't figures carry their verdict and one sentence, with the code below.
  const verdict = page.getByRole('figure', { name: /^Do One primary button per group/ });
  await expect(verdict.locator('.site-verdict-bar')).toHaveText('Do');
  await expect(verdict.locator('details summary')).toHaveText('Code, OnePrimaryAction.tsx');
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
  // When to use is a check list, a guidance list, where a component named at an item's end
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
  // A live example carries the touch mark, named as its tooltip says; a picture, such as the
  // anatomy figure, has none.
  await expect(
    page
      .locator('[data-section="overview"] .site-live-example')
      .first()
      .getByRole('img', { name: 'Interactive: try it' }),
  ).toBeVisible();
  await expect(page.locator('.site-anatomy .site-interactive-mark')).toHaveCount(0);
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
  // The variants figure names each variant with a callout on the start side of its item.
  const variantNames = page.locator('.catalogue-variants .catalogue-variant-label');
  await variantNames.first().scrollIntoViewIfNeeded();
  await expect(variantNames).toHaveText(['Primary', 'Secondary', 'Outline', 'Ghost', 'Text']);
  await expect(variantNames.first()).toHaveAttribute('data-side', 'left');
  const stages = page.locator('.site-anatomy .site-anatomy-stage');
  await expect(stages).toHaveCount(1);
  const placement = () =>
    stages.evaluate((stage) => {
      // Until the example and its badges render, there is nothing to place: poll again.
      const iconElement = stage.querySelector('.env-button > .env-icon');
      const badgeElement = [...stage.querySelectorAll('.site-anatomy-badge')].find(
        (item) => item.textContent === '2',
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
  const column = await codeGaps();
  expect(new Set(column.map(({ gap }) => gap)).size).toBe(1);
  await expect(page.locator('.site-anatomy-legend > li')).toHaveCount(4);
});

test('every anatomy figure numbers each part its legend names', async ({ page }) => {
  // It visits every component and pattern page, whose examples load as each opens.
  test.slow();
  // A legend part the example doesn't render would leave its number off the figure.
  const pages = figurePages.map((document) => ({
    id: document.id,
    route: document.route,
    figures: (document.sections ?? [])
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === 'example' && block.role === 'anatomy').length,
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
    for (const figure of await anatomy.all()) {
      const legend = await figure.locator('.site-anatomy-legend > li').count();
      await expect(
        figure.locator('.site-anatomy-stage .site-anatomy-badge'),
        `${id} numbers every part`,
      ).toHaveCount(legend);
    }
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
      const visible = (color: string) => !/^(transparent|rgba\(.*,\s*0\))$/.test(color);
      const found: string[] = [];
      for (const stage of stages) {
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

test("the overview's hero says what envUI is, leads to the components and the Docs, and shows the package's version", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/`);
  const hero = page.locator('.catalogue-overview-hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(hero.locator('.catalogue-overview-lede')).toContainText('A React design system');
  // The version is packages/ui/package.json's, as a quiet badge rather than a link, beside the
  // catalogue's counts.
  const versionLine = hero.locator('.catalogue-overview-version');
  await expect(versionLine).toHaveText(`v${version}`);
  await expect(versionLine.getByRole('link')).toHaveCount(0);
  await expect(hero.locator('.catalogue-overview-facts')).toContainText(
    `${references.filter(({ id }) => id !== 'field').length} components`,
  );
  await expect(hero.getByRole('link')).toHaveText(['Browse components', 'Read the Docs']);
  await expect(hero.getByRole('link', { name: 'Read the Docs', exact: true })).toHaveAttribute(
    'href',
    '/docs',
  );
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
  // Its picture is figures in thin lines, unfilled, out of the accessibility tree.
  const shapes = banner.locator('.site-banner-shapes');
  await expect(shapes).toHaveAttribute('aria-hidden', 'true');
  await expect(
    shapes.locator('.catalogue-banner-lines :is(rect, circle, polygon, path, line)').first(),
  ).toHaveCSS('fill', 'none');
  await expect(banner.locator('.catalogue-banner-motif')).toHaveCount(0);
  // The few pages with a motif of their own, such as Colors & themes, draw it out of the
  // accessibility tree and the tab order.
  await page.goto(`${siteDevUrl}/foundations/colors`);
  const motif = page.locator('.site-page-banner .catalogue-banner-motif');
  await expect(motif).toHaveAttribute('aria-hidden', 'true');
  await expect(motif).toHaveAttribute('inert', '');
  await expect(motif.locator('[data-motif="swatches"] .catalogue-motif-swatch')).toHaveCount(6);
  await expect(page.locator('.site-page-banner .site-banner-shapes')).toHaveCount(0);
});

test('the Icons page credits Material Symbols with their license, and the footer does not', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/foundations/icons`);
  const credit = page.locator('.catalogue-icons-credit');
  await expect(credit.getByRole('heading', { name: 'Where the icons come from' })).toBeVisible();
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
  await expect(tile.locator('.catalogue-related-stage')).toHaveAttribute('data-specimen', 'icons');
  await expect(tile.locator('.catalogue-related-canvas[data-fitted] svg')).toHaveCount(6);
  await expect(page.locator('.catalogue-related-placeholder')).toHaveCount(0);
});

test('every tile of the galleries of components and patterns is fitted, shown whole on its stage', async ({
  page,
}) => {
  // A tile's example loads as it nears the viewport and comes into its canvas after the fit has
  // started to watch it; each must still be fitted, and show what it holds inside its stage.
  const tiles = page.locator('.catalogue-gallery-tile');
  const unfitted = () =>
    tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
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
        const outside =
          Math.min(...shown.map((box) => box.left)) < stage.left - 1 ||
          Math.min(...shown.map((box) => box.top)) < stage.top - 1 ||
          Math.max(...shown.map((box) => box.right)) > stage.right + 1 ||
          Math.max(...shown.map((box) => box.bottom)) > stage.bottom + 1;
        return outside ? [`${name}: clipped`] : [];
      }),
    );
  for (const route of ['/components', '/patterns']) {
    await page.goto(`${siteDevUrl}${route}`);
    await expect(tiles.first()).toBeVisible();
    const count = await tiles.count();
    expect(count).toBeGreaterThan(route === '/components' ? 60 : 10);
    for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(unfitted, { message: route }).toEqual([]);
  }
});

test('figures with open overlays keep them in their stages, inert, and leave the page alone', async ({
  page,
}) => {
  test.slow();
  const pages = references
    .filter((reference) =>
      (reference.sections ?? []).some((section) =>
        section.blocks.some((block) => block.kind === 'example' && block.open),
      ),
    )
    .map(({ id }) => id);
  expect(pages).toEqual(expect.arrayContaining(['dialog', 'menu', 'tooltip', 'toast', 'select']));
  await page.goto(`${siteDevUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    const rooms = page.locator('.catalogue-open-example');
    await expect(rooms.first()).toBeVisible();
    await expect(page.locator('.site-loading')).toHaveCount(0);
    // Every open figure shows an overlay, inside its stage, and is a picture: inert.
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
                    '.env-popup, .env-dialog-popup, .env-sheet-popup, .env-command-palette, .env-toast',
                  ),
                ];
                const name = room.dataset.openExample;
                if (!room.inert) return [`${name} is not inert`];
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

test('F6 on the Toast page reaches a notification raised there, past the figures @engines', async ({
  page,
}) => {
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
  // The overview plays its Save changes in a figure; the export example raises a live notice.
  await page.getByRole('button', { name: 'Export members' }).first().click();
  const live = page
    .locator(
      '.env-toast-viewport:not(:is(.catalogue-open-example, .catalogue-motion-subject) .env-toast-viewport)',
    )
    .filter({ has: page.locator('.env-toast') });
  await expect(live).toHaveCount(1);
  await page.keyboard.press('F6');
  await expect(live).toBeFocused();
});
