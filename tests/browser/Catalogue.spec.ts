import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, siteUrl } from './HostedSite';
import { chooseScheme } from './CatalogueThemes';
import { readdirSync, readFileSync } from 'node:fs';
import { readMap } from '../../packages/codemods/src/map.mjs';
import { readReleaseNotes } from '../../scripts/ReleaseNotes.mjs';
import { technicalText } from '../../scripts/SiteContent.mjs';
import { renderLlmsText, renderSkill } from '../../scripts/SiteAgentFiles.mjs';
import { references } from '../../apps/catalogue/src/Reference';
import {
  allPages,
  normalizeRoute,
  sectionHome,
  siteSections,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';
import { displayStorageKeys } from '../../apps/catalogue/src/theme/DisplayStorage';

const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;
const components = references.map(({ id }) => id);

/**
 * Opens a route of the site without loading it again, as a link in it does: the address changes
 * and the site shows the route's page.
 */
async function goTo(page: Page, path: string) {
  await page.evaluate((address) => {
    history.pushState(null, '', address);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

test('the 0.x routes of renamed pages open the pages under their new names', () => {
  const { docs } = readMap() as { docs: Record<string, string> };
  for (const [from, to] of Object.entries<string>(docs).filter(([key]) => !key.startsWith('$'))) {
    expect(components).toContain(to);
    expect(components).not.toContain(from);
    // A page's views are gone: Preview and Usage open its page, and Props its page in the Docs.
    for (const view of ['preview', 'usage'])
      expect(normalizeRoute(`components/${from}/${view}`)).toBe(`components/${to}`);
    expect(normalizeRoute(`components/${from}/props`)).toBe(`docs/components/${to}`);
  }
});

test('the addresses of the views before the Site and the Docs split open the pages they became', () => {
  const routes: Record<string, string> = {
    'components/button/overview': 'components/button',
    'components/button/props?section=props-Button-variant':
      'docs/components/button?section=props-Button-variant',
    'components/button/overview?section=keyboard': 'components/button?section=keyboard',
    'components/field/overview': 'docs/components/field',
    'foundations/colors/preview': 'foundations/colors',
    'foundations/colors/usage': 'docs/foundations/colors',
    'foundations/tokens': 'docs/tokens',
    // Nine foundations became six: merged pages open the page they joined.
    'foundations/scale': 'foundations/spacing',
    'foundations/scale/usage': 'docs/foundations/spacing',
    'docs/foundations/scale': 'docs/foundations/spacing',
    'foundations/composition': 'docs/customizing',
    'docs/foundations/composition': 'docs/customizing',
    'docs/customizing-colors': 'docs/customizing',
    'overview/components': 'overview',
    'overview/components?section=components-actions': 'components?section=components-actions',
    'overview/get-started': 'docs/setup',
    'overview/get-started?skill=migrate&section=local-development': 'docs/agent-tooling',
    // The agent skills' page went with the skills.
    'docs/agent-skills': 'docs/agent-tooling',
    // The agent benchmark went, and its page opens the overview.
    benchmark: 'overview',
    'get-started/migration': 'docs/migration',
    // The Site's Get started page is the setup guide.
    'get-started': 'docs/setup',
    'contributing/library-development': 'overview',
    // The Site's changelog is the Docs' now, with its release notes.
    changelog: 'docs/changelog',
    'changelog?section=release-0-7-0': 'docs/changelog?section=release-0-7-0',
    // Pages folded into another open it, at the section that holds them, and in the Docs its page.
    'components/bar': 'components/drawer',
    'components/rail/props': 'docs/components/drawer',
    'components/page-header?section=sticky': 'components/page?section=sticky',
    'docs/components/page-header': 'docs/components/page',
    'patterns/feature-cards': 'components/card?section=feature-card',
    'docs/patterns/feature-cards': 'docs/components/card',
    'patterns/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'components/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'docs/patterns/search-trigger': 'docs/components/command-palette',
    // Patterns merged into others open the pattern they joined, on the Site and in the Docs.
    'patterns/window-frame': 'patterns/app-frame',
    'docs/patterns/window-frame': 'docs/patterns/app-frame',
    'components/window-frame': 'patterns/app-frame',
    'patterns/account-menu': 'patterns/account-and-organizations',
    'patterns/organization-switcher': 'patterns/account-and-organizations',
    'docs/patterns/organization-switcher': 'docs/patterns/account-and-organizations',
    // The content guidelines are the Writing guide in the Docs.
    'foundations/content': 'docs/writing',
    'docs/foundations/content': 'docs/writing',
  };
  for (const [from, to] of Object.entries(routes)) expect(normalizeRoute(from), from).toBe(to);
  // Every page of both areas is its own route.
  for (const { path } of allPages) expect(normalizeRoute(path)).toBe(path);
});

test('a guide in the Docs renders shared Markdown and follows relative links', async ({ page }) => {
  await page.goto(`${catalogueUrl}/docs/customizing`);
  await expect(page.getByRole('heading', { name: 'Compose one root', exact: true })).toBeVisible();
  await expect(
    page.getByText('Surface supplies fill, padding and corners', { exact: false }),
  ).toBeVisible();
  await page
    .locator('.docs-article')
    .getByRole('link', { name: 'Surface', exact: true })
    .first()
    .click();
  // A link to a component opens its page on the Site.
  await expect(page).toHaveURL(/\/components\/surface$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Surface');

  // A guide opens on a page of its own in the Docs, current in their navigation.
  await page.goto(`${catalogueUrl}/docs`);
  await page
    .locator('.docs-article')
    .getByRole('link', { name: 'Develop envUI locally', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/local-development$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Develop envUI locally');
  await expect(page.locator('.docs-article')).toContainText('npm run dev:library');
  await expect(
    page
      .getByRole('navigation', { name: 'Docs' })
      .getByRole('link', { name: 'Develop envUI locally', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  // The address it had on the Get started view, as a hash, leads to the same page as a path.
  await page.goto(
    `${catalogueUrl}/#/overview/get-started?document=migration&section=documentation`,
  );
  await expect(page).toHaveURL(/\/docs\/migration$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Migrate an interface to envUI');
});

test('palette editing uses public controls and remains temporary and independent between themes', async ({
  page,
}) => {
  // The editable palette, with its tokens and values, is on the colors guide in the Docs.
  await page.goto(`${catalogueUrl}/docs/foundations/colors`);
  const app = page.locator('.docs-app');
  const canvasValue = () =>
    app.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--env-color-bg-page').trim(),
    );
  const initialLight = await canvasValue();
  const swatch = page.getByRole('button', { name: /^#[\da-f]{6} page background: pick a color$/ });
  await expect(swatch).toHaveClass(/env-button/);
  await swatch.click();
  const dialog = page.getByRole('dialog', { name: 'Page background', exact: true });
  await expect(dialog.locator('.env-color-picker')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Hex' }).fill('123456');
  await dialog.getByRole('textbox', { name: 'Hex' }).press('Enter');
  await expect.poll(canvasValue).toBe('#123456');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await chooseScheme(page, 'dark');
  expect(await canvasValue()).not.toBe('#123456');
  await swatch.click();
  await dialog.getByRole('textbox', { name: 'Hex' }).fill('#abcdef');
  await dialog.getByRole('textbox', { name: 'Hex' }).press('Enter');
  await expect.poll(canvasValue).toBe('#abcdef');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await chooseScheme(page, 'light');
  await expect.poll(canvasValue).toBe('#123456');
  await page.reload();
  await expect.poll(canvasValue).toBe(initialLight);
});

test('live examples keep links in place, show their source, and specimens show forced states', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/components/button`);
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
    column: Math.round(panel.closest('.docs-figure-section')!.getBoundingClientRect().width),
  }));
  expect(widths.panel).toBe(widths.column);
  // Catalogue-only specimens, such as the forced interaction states, sit in the section they
  // illustrate on the figure template.
  await expect(page.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
});

test('a component page shows plain sections, equal cells and the parts of its anatomy', async ({
  page,
}) => {
  // Wide enough for the overview's three figures to share a row.
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${catalogueUrl}/components/button`);
  // One page of sections, with no views; the props are on its page in the Docs, which API opens.
  await expect(page.locator('.docs-page-header').getByRole('tab')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'API', exact: true })).toHaveAttribute(
    'href',
    '/docs/components/button',
  );
  // Ordinary headings in the fixed order, and no questions.
  // Button is in the one-file structure, whose sections every kind of page shares.
  await expect(page.locator('.docs-figure-section-heading h2')).toHaveText([
    'Overview',
    'Rules',
    'Anatomy',
    'Variants',
    'Behaviour',
  ]);
  await expect(page.locator('.docs-figures .env-message')).toHaveCount(0);
  // Figures that share a row are cells of one size: equal widths, and stages as tall as the
  // tallest, once their examples have loaded.
  await expect(page.locator('[data-section="overview"] .docs-loading')).toHaveCount(0);
  const cells = () =>
    page
      .locator('[data-section="overview"] .docs-figure-run')
      .first()
      .evaluate((run) => {
        const stages = [...run.querySelectorAll('.docs-live-example')].map((stage) =>
          stage.getBoundingClientRect(),
        );
        return {
          count: stages.length,
          widths: new Set(stages.map((box) => Math.round(box.width))).size,
          heights: new Set(stages.map((box) => Math.round(box.height))).size,
        };
      });
  await expect.poll(cells).toEqual({ count: 3, widths: 1, heights: 1 });
  // Do and don't figures carry their verdict and one sentence, with the code below.
  const verdict = page.getByRole('figure', { name: /^Do One primary button per group/ });
  await expect(verdict.locator('.docs-verdict-bar')).toHaveText('Do');
  await expect(verdict.locator('details summary')).toHaveText('Code, OnePrimaryAction.tsx');
  // Its stage and its bar are connected rows: large outer corners, small inner ones.
  const corners = await verdict.evaluate((figure) => {
    const stage = getComputedStyle(figure.querySelector('.docs-verdict-stage')!);
    const bar = getComputedStyle(figure.querySelector('.docs-verdict-bar')!);
    return {
      outer: stage.borderTopLeftRadius === bar.borderBottomLeftRadius,
      inner: stage.borderBottomLeftRadius === bar.borderTopLeftRadius,
      larger: parseFloat(stage.borderTopLeftRadius) > parseFloat(stage.borderBottomLeftRadius),
    };
  });
  expect(corners).toEqual({ outer: true, inner: true, larger: true });
  // When to use is a check list, a guidance list, where a component named at an item's end
  // follows it after a muted dot: the Button family's own page, so not a link.
  const useWhen = page.locator('.docs-when .docs-guidance li');
  await expect(useWhen.nth(2)).toHaveText(
    'A familiar action as an icon alone, in a dense place · IconButton',
  );
  await expect(page.locator('.docs-when .docs-list-name')).toHaveText([
    'IconButton',
    'ConfirmButton',
    'CopyButton',
    'ButtonGroup',
  ]);
  await expect(page.locator('.docs-when a')).toHaveCount(0);
  // A live example carries the touch mark, named as its tooltip says; a picture, such as the
  // anatomy figure, has none.
  await expect(
    page
      .locator('[data-section="overview"] .docs-live-example')
      .first()
      .getByRole('img', { name: 'Interactive: try it' }),
  ).toBeVisible();
  await expect(page.locator('.docs-anatomy .docs-interactive-mark')).toHaveCount(0);
  // Related, at the end, has a tile for each alternative, of one size, each a picture of it,
  // inert and fitted to its stage, once the section nears the viewport.
  await expect(page.locator('[data-section="usage"] .docs-related-tile')).toHaveCount(0);
  const tiles = page.locator('[data-section="related"] .docs-related-tile');
  await expect(tiles.locator('.docs-related-name')).toHaveText([
    'Link',
    'SegmentedControl',
    'Switch',
    'Menu',
    'Dialog',
  ]);
  await tiles.first().scrollIntoViewIfNeeded();
  const tileStages = () =>
    tiles.locator('.docs-related-stage').evaluateAll((stages) => ({
      widths: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().width))).size,
      heights: new Set(stages.map((stage) => Math.round(stage.getBoundingClientRect().height)))
        .size,
      fitted: stages.filter((stage) =>
        stage.querySelector('.docs-related-canvas[data-fitted][inert]'),
      ).length,
    }));
  await expect.poll(tileStages).toEqual({ widths: 1, heights: 1, fitted: 5 });
  // The anatomy numbers each part of the live button beside the part it names, in the theme the
  // reader has chosen alone, and keeps them there as the page narrows and the theme changes.
  // The variants figure names each variant with a callout on the start side of its item.
  const variantNames = page.locator('.docs-variants .docs-variant-label');
  await variantNames.first().scrollIntoViewIfNeeded();
  await expect(variantNames).toHaveText(['Primary', 'Secondary', 'Outline', 'Ghost', 'Text']);
  await expect(variantNames.first()).toHaveAttribute('data-side', 'left');
  const stages = page.locator('.docs-anatomy .docs-anatomy-stage');
  await expect(stages).toHaveCount(1);
  const placement = () =>
    stages.evaluate((stage) => {
      // Until the example and its badges render, there is nothing to place: poll again.
      const iconElement = stage.querySelector('.env-button > .env-icon');
      const badgeElement = [...stage.querySelectorAll('.docs-anatomy-badge')].find(
        (item) => item.textContent === '2',
      );
      if (!iconElement || !badgeElement) return null;
      const icon = iconElement.getBoundingClientRect();
      const badge = badgeElement.getBoundingClientRect();
      return {
        badges: stage.querySelectorAll('.docs-anatomy-badge').length,
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
  await expect(page.locator('.docs-anatomy-legend > li')).toHaveCount(4);
});

test('every anatomy figure numbers each part its legend names', async ({ page }) => {
  // It visits every page on the figure template, whose examples load as each opens.
  test.slow();
  // A legend part the example doesn't render would leave its number off the figure.
  const pages = references
    .filter((reference) => reference.format === 'figures')
    .map((reference) => ({
      id: reference.id,
      figures: (reference.sections ?? [])
        .flatMap((section) => section.blocks)
        .filter((block) => block.kind === 'example' && block.role === 'anatomy').length,
    }));
  expect(pages.length).toBeGreaterThan(0);
  await page.goto(`${catalogueUrl}/`);
  for (const { id, figures } of pages) {
    await goTo(page, `/components/${id}`);
    const anatomy = page.locator('.docs-anatomy');
    await expect(anatomy, `${id} shows its anatomy figures`).toHaveCount(figures);
    for (const figure of await anatomy.all()) {
      const legend = await figure.locator('.docs-anatomy-legend > li').count();
      await expect(
        figure.locator('.docs-anatomy-stage .docs-anatomy-badge'),
        `${id} numbers every part`,
      ).toHaveCount(legend);
    }
  }
});

test('every stage is the only frame of its figure', async ({ page }) => {
  // It visits every page on the figure template, whose examples load as each opens.
  test.slow();
  // One frame per figure: no stage sits inside another framed or filled box in the article, such
  // as a specimen wrapped in a Surface or a stage inside another stage. A do or don't figure's own
  // frame, which holds its stage and its verdict bar, is the figure's one frame. The band a group of
  // sections sits on is outside the group, so it is the page there, not a frame.
  const pages = references.filter((reference) => reference.format === 'figures');
  expect(pages.length).toBeGreaterThan(0);
  await page.goto(`${catalogueUrl}/`);
  for (const { id } of pages) {
    await goTo(page, `/components/${id}`);
    await expect(page.locator('.docs-figures .docs-figure-section').first()).toBeVisible();
    await expect(page.locator('.docs-loading')).toHaveCount(0);
    const framed = await page.evaluate(() => {
      const stages = document.querySelectorAll(
        '.docs-figures :is(.docs-live-example, .docs-verdict-stage, .docs-anatomy-stage, .docs-related-stage, .docs-specimen-grid, .docs-matrix-scroll)',
      );
      const visible = (color: string) => !/^(transparent|rgba\(.*,\s*0\))$/.test(color);
      const found: string[] = [];
      for (const stage of stages) {
        const canvas = getComputedStyle(stage).backgroundColor;
        for (
          let node = stage.parentElement;
          node && !node.classList.contains('docs-figures');
          node = node.parentElement
        ) {
          if (node.classList.contains('docs-verdict-frame')) continue;
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

test("a specimen's titles and captions name options in words, not values", async ({ page }) => {
  // The Site speaks plain language in its specimens too: Small rather than sm, Step 1 rather than
  // gap={1}. A value starts in lower case or is written as code, with =, braces, quotes or --.
  const pages = readdirSync('docs/components')
    .filter((file) => readFileSync(`docs/components/${file}`, 'utf8').includes('<!-- specimen:'))
    .map((file) => file.replace(/\.md$/, ''));
  expect(pages.length).toBeGreaterThan(0);
  await page.goto(`${catalogueUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    await expect(
      page.locator('.docs-figures :is(.docs-specimen-grid, .docs-matrix-scroll)').first(),
    ).toBeVisible();
    const texts = await page
      .locator(
        '.docs-figures :is(.docs-specimen > :is(h3, h4, h5, .env-text[data-variant="caption"]), .docs-matrix-scroll th)',
      )
      .allTextContents();
    const raw = texts
      .map((text) => text.trim())
      .filter((text) => text && (/^[a-z]/.test(text) || /[={}"`]|--/.test(text)));
    expect(raw, `${id} names options by their values`).toEqual([]);
  }
});

/**
 * The words a page of the Site shows and names, as a reader and a screen reader meet them: every
 * text and the names, titles and placeholders of its content, outside the Code disclosures under
 * its figures and outside the examples they show, which are envUI at work with an application's
 * own sample text. Foundation figures, specimens, captions, swatches and legends all count.
 */
async function siteWords(page: Page) {
  return page.locator('.docs-main').evaluate((main) => {
    const skipped =
      '.docs-live-example-code, .docs-code-slot, pre, .env-code-block, .docs-live-example, .docs-verdict-stage, .docs-anatomy-subject, .docs-related-stage, .docs-open-example, [hidden]';
    const words: string[] = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode())
      if (node.textContent?.trim() && !node.parentElement?.closest(skipped))
        words.push(node.textContent.trim());
    for (const element of main.querySelectorAll('[aria-label], [title], [alt], [placeholder]'))
      if (!element.closest(skipped))
        for (const name of ['aria-label', 'title', 'alt', 'placeholder'])
          if (element.getAttribute(name)) words.push(element.getAttribute(name)!);
    return words;
  });
}

/** The technical text in a page's words, each as "kind: text". */
const technicalOf = (words: string[]) =>
  words.flatMap((text) => technicalText(text).map((found) => `${found.kind}: ${found.text}`));

/**
 * The pages that show no technical text at all: every foundation, dev mode's page and every
 * pattern. Every other page of the Site is reported until it is rewritten to the same rule, then
 * joins this list.
 */
const plainPages = [
  'foundations/colors',
  'foundations/typography',
  'foundations/spacing',
  'foundations/responsive',
  'foundations/icons',
  'foundations/accessibility',
  // Dev mode's page, written as a foundation's is, with its guide in the Docs.
  'dev-mode',
  // The patterns, each its decision and its compositions.
  ...[
    'forms',
    'settings',
    'destructive-actions',
    'feedback',
    'loading',
    'empty-states',
    'key-figures',
    'navigation',
    'app-frame',
    'account-and-organizations',
    'filtering',
    'data-tables',
    'progressive-disclosure',
    'conversation',
    'file-upload',
  ].map((id) => `patterns/${id}`),
];

test('the foundation and pattern pages show no technical text, in their words or their figures', async ({
  page,
}) => {
  // The Site is for people looking at envUI: no token names, hex colors, lengths, percentages or
  // code. They belong to each foundation's guide and each pattern's page in the Docs.
  test.slow();
  await page.goto(`${catalogueUrl}/`);
  for (const path of plainPages) {
    await goTo(page, `/${path}`);
    if (path.startsWith('foundations/') || path === 'dev-mode') {
      // A foundation's sections: its preview's topics, or its Markdown's in the one-file structure.
      await expect(page.locator('.docs-topic, .docs-figure-section').last()).toBeVisible();
      // The marks of a figure are measured once it has laid out.
      if (await page.locator('.docs-marked').count())
        await expect(page.locator('.docs-anatomy-badge').first()).toBeVisible();
      // Guide opens the foundation's guide in the Docs, as API does for a component.
      await expect(page.getByRole('link', { name: 'Guide', exact: true })).toHaveAttribute(
        'href',
        `/docs/${path}`,
      );
    } else await expect(page.locator('.docs-when').first()).toBeVisible();
    expect(technicalOf(await siteWords(page)), `${path} shows technical text`).toEqual([]);
  }
});

/** The component pages of the Site held to the plain-language rule. */
const plainComponentPages = allPages.filter(
  ({ kind, area }) => area === 'site' && kind === 'component',
);

test('component pages show no technical text, in their words or their figures', async ({
  page,
}) => {
  // Lengths, tokens, percentages and code names belong to the page's In code, in the Docs.
  test.slow();
  await page.goto(`${catalogueUrl}/`);
  const found: string[] = [];
  for (const { path, title } of plainComponentPages) {
    await goTo(page, `/${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(title);
    for (const entry of technicalOf(await siteWords(page))) found.push(`${path}: ${entry}`);
  }
  expect(found, "Say it in words, and move the value to the page's In code.").toEqual([]);
});

test('the technical text on every other page of the Site is counted, for the rewrite to come', async ({
  page,
}, testInfo) => {
  // Reporting only: the counts say how far each page is from the model pages' rule.
  test.slow();
  await page.goto(`${catalogueUrl}/`);
  const counts: string[] = [];
  for (const { path, title, kind, area } of allPages) {
    if (area !== 'site' || plainPages.includes(path)) continue;
    if (plainComponentPages.some((plain) => plain.path === path)) continue;
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    const found = technicalOf(await siteWords(page));
    if (!found.length) continue;
    const kinds = Map.groupBy(found, (entry) => entry.split(':')[0]!);
    counts.push(
      `${path}: ${found.length} (${[...kinds].map(([name, list]) => `${name} ${list.length}`).join(', ')})`,
    );
  }
  const report = counts.length ? counts.join('\n') : 'No technical text on any page.';
  console.log(`Technical text on the Site, by page:\n${report}`);
  await testInfo.attach('technical-text.txt', { body: report, contentType: 'text/plain' });
});

/** The pages set in the Site's type hierarchy so far, the samples of the typography rework. */
const typographyPages = [
  'foundations/spacing',
  'foundations/typography',
  'components/button',
  'patterns/forms',
];

test("the Site's text keeps a readable measure, and opens each section with a larger lead", async ({
  page,
}) => {
  // Running text wraps at about 70 characters, never one long line across the page; a section's
  // lead is larger than the quieter text that supports it.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${catalogueUrl}/`);
  for (const path of typographyPages) {
    await goTo(page, `/${path}`);
    const lead = page.locator('.docs-lead').first();
    await expect(lead).toBeVisible();
    const found = await page.evaluate(() => {
      const text = [
        ...document.querySelectorAll<HTMLElement>(
          '.docs-lead, .docs-supporting, .docs-figures .env-markdown > p',
        ),
      ].filter((element) => !element.closest('[data-figure], .docs-shared-row'));
      const long = text.flatMap((element) => {
        const lines = Math.round(
          element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
        );
        const characters = element.textContent!.trim().length / Math.max(lines, 1);
        return characters > 80 ? [`${Math.round(characters)}: ${element.textContent!.trim()}`] : [];
      });
      const style = (selector: string) => {
        const element = document.querySelector(selector);
        return (
          element && getComputedStyle(element.matches('p') ? element : element.querySelector('p')!)
        );
      };
      const leadStyle = style('.docs-lead')!;
      const supporting = style(
        '.docs-supporting, .docs-figures .env-markdown:not(.docs-lead) > p',
      )!;
      return {
        long,
        larger: parseFloat(leadStyle.fontSize) > parseFloat(supporting.fontSize),
        quieter: leadStyle.color !== supporting.color,
      };
    });
    expect(found, path).toEqual({ long: [], larger: true, quieter: true });
  }
});

test('a component page groups its sections into three, the middle one on the band', async ({
  page,
}) => {
  // Overview with Variants; When to use with Anatomy, on the page's one band across the content
  // pane; Adapting to width with Accessibility; then Related, on the page. A page groups the
  // sections it has.
  const groups = () =>
    page.locator('.docs-section-groups > *').evaluateAll((elements) =>
      elements.map((element) => ({
        band: element.classList.contains('docs-band'),
        sections: [...element.querySelectorAll('[data-section]')].map(
          (section) => (section as HTMLElement).dataset.section,
        ),
      })),
    );
  await page.goto(`${catalogueUrl}/components/scaffold`);
  await expect.poll(groups).toEqual([
    { band: false, sections: ['overview', 'variants'] },
    { band: true, sections: ['usage', 'anatomy'] },
    { band: false, sections: ['width', 'accessibility'] },
    { band: false, sections: ['related'] },
  ]);
  // The band spans the whole content pane, gutters included; its sections keep the column.
  const widths = await page.evaluate(() => {
    const width = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return {
      band: width('.docs-band').width,
      main: width('.docs-main').width,
      column: width('.docs-band > .docs-section-group').left,
      first: width('.docs-section-groups > .docs-section-group').left,
    };
  });
  expect(widths.band).toBe(widths.main);
  expect(widths.column).toBe(widths.first);
  // Box has no Variants, Anatomy or Adapting to width, and its Accessibility holds only the lists
  // that are in the Docs, so the Site has no third group for it.
  await goTo(page, '/components/box');
  await expect.poll(groups).toEqual([
    { band: false, sections: ['overview'] },
    { band: true, sections: ['usage'] },
    { band: false, sections: ['related'] },
  ]);
});

test("a pattern's guide lists what it needs, and Field's page in the Docs ends with Related", async ({
  page,
}) => {
  // Each pattern's guide in the Docs lists what the application and envUI provide, as plain lists
  // under Accessibility. The address of the page that once listed them all opens the Docs' home,
  // whose Patterns list links every pattern's guide.
  await page.goto(`${catalogueUrl}/docs/patterns`);
  await expect(page).toHaveURL(/\/docs$/);
  const guides = page
    .locator('.docs-article section', {
      has: page.getByRole('heading', { name: 'Patterns', exact: true }),
    })
    .getByRole('link');
  await expect(guides).toHaveText(
    allPages
      .filter((entry) => entry.area === 'docs' && entry.section === 'Patterns')
      .map((entry) => entry.title),
  );
  await guides.getByText('Form layout and validation', { exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/patterns\/forms$/);
  // Forms is in the one-file structure: its lists are under Behaviour, in the page's order.
  const provides = page.locator('[data-section="behaviour"]');
  for (const name of ['envUI provides', 'You provide'])
    await expect(provides.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  await expect(provides.getByRole('listitem').filter({ hasText: 'noValidate' })).toHaveCount(1);
  await expect(page.locator('.docs-article .env-card')).toHaveCount(0);
  // Field's whole page is in the Docs: its sections, props, part names and changelog, then Related
  // at the end, on the page rather than the band.
  await page.goto(`${catalogueUrl}/docs/components/field`);
  const ends = await page.evaluate(() => {
    const related = document.querySelector('.docs-related');
    const changelog = document.querySelector('.docs-changelog');
    return Boolean(
      related &&
        changelog &&
        !related.closest('.docs-band') &&
        changelog.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(ends).toBe(true);
});

test("a page's changelog in the Docs is collapsed, and a link to it opens it", async ({ page }) => {
  await page.goto(`${catalogueUrl}/docs/components/button`);
  const changelog = page.locator('.docs-changelog details');
  await expect(changelog.locator('summary')).toHaveText('Changelog');
  await expect(changelog).not.toHaveAttribute('open');
  await expect(changelog.locator('.docs-changelog-entries')).toBeHidden();
  // Following a link to it on the page opens it, as loading its address does.
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '/docs/components/button#changelog';
    document.querySelector('#docs-main')!.append(link);
    link.click();
    link.remove();
  });
  await expect(changelog).toHaveAttribute('open');
  await page.goto(`${catalogueUrl}/docs/patterns/forms#changelog`);
  await expect(page.locator('.docs-changelog details')).toHaveAttribute('open');
  await expect(page.locator('#changelog')).toBeInViewport();
});

test('the props in the Docs link each source file at the revision the site was built from', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/docs/components/button`);
  const link = page.getByRole('link', { name: 'actions/Button.tsx', exact: true });
  // The release tag of a release build, or the commit of any other: never a moving branch.
  const revision = `(?:v${version.replaceAll('.', '\\.')}|[0-9a-f]{40})`;
  await expect(link).toHaveAttribute(
    'href',
    new RegExp(
      `^https://github\\.com/envsemble/envUI/blob/${revision}/packages/ui/src/actions/Button\\.tsx$`,
    ),
  );
});

test('the hosted build opens every page of the Site and the Docs without network or script errors', async ({
  page,
  context,
}) => {
  // It renders every page of both areas, about 15 s on a fast machine and over 30 s on a busy one.
  test.slow();
  requireSite();
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Nothing loads from elsewhere: every request but the site's own is refused.
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await serveSite(page);
  await page.goto(`${siteUrl}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(
    page.locator('.docs-footer').getByRole('navigation', { name: 'Footer' }),
  ).toContainText('For agents');
  for (const { path, title, kind, area } of allPages) {
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    await expect(page.getByText('This page failed to render')).toHaveCount(0);
    // A page of the Site links into the Docs only through its API button and the Docs link, not
    // from its content, the links generated from its frontmatter included, such as Built from.
    if (area === 'site' && kind !== 'home')
      await expect(
        page.locator('.docs-main :is(.docs-article, .docs-band) a[href^="/docs"]'),
        path,
      ).toHaveCount(0);
  }
  // A deep link loads its page, in the Docs too.
  await page.goto(`${siteUrl}/docs/setup`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  // The files for coding agents are at the root, as text rather than the page.
  const agentFiles = await page.evaluate(async () =>
    Promise.all(
      ['/SKILL.md', '/llms.txt'].map(async (path) => {
        const response = await fetch(path);
        return { type: response.headers.get('Content-Type'), text: await response.text() };
      }),
    ),
  );
  expect(agentFiles).toEqual([
    { type: 'text/markdown; charset=utf-8', text: renderSkill() },
    { type: 'text/plain; charset=utf-8', text: renderLlmsText() },
  ]);
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Inter"'))).toBe(true);
});

test('single previews retain state when the theme changes', async ({ page }) => {
  // The 0.x preview of text fields opens the TextField page, whose live examples follow the
  // documentation's theme.
  await page.goto(`${catalogueUrl}/components/input/preview`);
  const example = page.getByRole('group', { name: 'TextField example', exact: true });
  const projectName = example.getByRole('textbox', { name: 'Project name', exact: true });
  await projectName.fill('Winter release');
  await chooseScheme(page, 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(projectName).toHaveValue('Winter release');
  for (const width of [1920, 1440, 960, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(example).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(projectName).toHaveValue('Winter release');
  const navigationTrigger = page.getByRole('button', { name: 'Open navigation' });
  const mobileNavigation = page.getByRole('dialog', { name: 'Site', exact: true });
  // Opened by a press or from the keyboard, Escape returns focus to the trigger, also in WebKit,
  // where a press focuses no button, and with focus elsewhere before.
  for (const by of ['press', 'keyboard'] as const) {
    await projectName.focus();
    if (by === 'press') await navigationTrigger.click();
    else {
      await navigationTrigger.focus();
      await page.keyboard.press('Enter');
    }
    await expect(mobileNavigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mobileNavigation).toHaveCount(0);
    await expect(navigationTrigger, by).toBeFocused();
  }
  await navigationTrigger.click();
  await mobileNavigation.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(mobileNavigation).toHaveCount(0);
  await expect(navigationTrigger).toBeFocused();
  await navigationTrigger.click();
  await mobileNavigation.getByRole('link', { name: 'TextField', exact: true }).click();
  await expect(mobileNavigation).toHaveCount(0);
  await expect
    .poll(() =>
      page.locator('#docs-main').evaluate((main) => main.contains(document.activeElement)),
    )
    .toBe(true);
  await expect(projectName).toHaveValue('Winter release');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(mobileNavigation).toHaveCount(0);
  await expect(page.locator('.docs-sidebar')).toBeVisible();
  // The 0.x preview of checkboxes opens the Checkbox page, whose live example keeps its state.
  await goTo(page, '/components/checkbox/preview');
  const archived = page
    .getByRole('group', { name: 'Checkbox example', exact: true })
    .getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'light');
  await expect(archived).toBeChecked();
  // The 0.x route of disclosures opens the Disclosure page, whose live example keeps its state.
  await goTo(page, '/components/notes/preview');
  const disclosure = page.getByRole('group', { name: 'Disclosure example', exact: true });
  await disclosure.locator('summary').click();
  await chooseScheme(page, 'dark');
  await expect(disclosure).toHaveAttribute('data-env-theme', 'dark');
  await expect(disclosure.locator('details')).toHaveAttribute('open', '');
});

test('the navigation holds the wordmark and search, the page the other area and Display, and there is no top bar', async ({
  page,
}) => {
  for (const [address, other, brand] of [
    // On the Site the wordmark tops the rail; the Docs, which have no rail, put it in the drawer.
    ['/components/menu', 'Docs', 'Site'],
    ['/docs/components/menu', 'Site', 'Docs'],
  ] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${catalogueUrl}${address}`);
    await expect(page.getByRole('banner')).toHaveCount(0);
    const wordmark = page
      .getByRole('navigation', { name: brand })
      .getByRole('link', { name: /^envUI( Docs)? home$/ });
    const search = page.locator('.docs-sidebar').getByRole('button', { name: /^Search/ });
    await expect(wordmark, address).toBeInViewport();
    await expect(search, address).toBeInViewport();
    // The wordmark and search share the first row.
    const [mark, field] = await Promise.all([wordmark.boundingBox(), search.boundingBox()]);
    expect(Math.abs(mark!.y + mark!.height / 2 - (field!.y + field!.height / 2))).toBeLessThan(4);
    expect(mark!.x + mark!.width).toBeLessThanOrEqual(field!.x);
    // Search is as wide as its content; on the Site it is centred in the drawer, and the drawer's
    // first item starts level with the rail's first destination.
    const drawer = (await page.locator('.docs-sidebar').boundingBox())!;
    expect(field!.width).toBeLessThan(drawer.width - 24);
    // The list may be scrolled to the current page: where it starts is where its first item does.
    const first = (await page.locator('.docs-sidebar .env-drawer-list').boundingBox())!;
    if (brand === 'Site') {
      const left = field!.x - drawer.x;
      const right = drawer.x + drawer.width - (field!.x + field!.width);
      expect(Math.abs(left - right), address).toBeLessThan(2);
      const destination = (await page.locator('.docs-rail .env-rail-item').first().boundingBox())!;
      expect(Math.abs(first.y - destination.y), address).toBeLessThan(1);
    }
    // The other area and the Display menu are ghost buttons at the page's top end.
    const actions = page.locator('.docs-page-actions');
    for (const control of [
      actions.getByRole('link', { name: other, exact: true }),
      actions.getByRole('button', { name: 'Display', exact: true }),
    ]) {
      await expect(control, address).toBeInViewport();
      expect((await control.boundingBox())!.x, address).toBeGreaterThan(640);
    }
    // The theme is in the Display menu alone.
    await expect(page.getByRole('button', { name: /^Switch to/ })).toHaveCount(0);

    // A narrow window shows the menu button and search at the page's top start, and the other area
    // and Display as icon buttons at its top end.
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole('button', { name: 'Open navigation', exact: true });
    for (const [control, start] of [
      [menu, true],
      [page.locator('.docs-compact-controls').getByRole('button', { name: /^Search/ }), true],
      [actions.getByRole('link', { name: other, exact: true }), false],
      [actions.getByRole('button', { name: 'Display', exact: true }), false],
    ] as const) {
      const box = await control.boundingBox();
      expect(box, address).not.toBeNull();
      expect(box!.x, address).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, address).toBeLessThanOrEqual(390);
      expect(box!.x < 195, address).toBe(start);
    }
    await menu.click();
    const sheet = page.getByRole('dialog', { name: address.startsWith('/docs') ? 'Docs' : 'Site' });
    await expect(sheet.getByRole('button', { name: /^Search/ })).toBeInViewport();
    await page.keyboard.press('Escape');
  }
});

test('an example that fails to load says so in place, and loads again on request', async ({
  page,
}) => {
  const example = '**/src/examples/button/CreateProject.tsx*';
  await page.route(example, (route) => route.abort());
  await page.goto(`${catalogueUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  // The rest of the page is still there.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(hero.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  await page.unroute(example);
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(hero.getByText('The example could not load')).toHaveCount(0);
  // Focus stays where the example is, rather than falling to the page.
  expect(await hero.evaluate((group) => group.contains(document.activeElement))).toBe(true);
});

test('in the hosted build, an example whose file is missing offers a reload, which loads it', async ({
  page,
}) => {
  // A build's chunk that failed stays failed until the page reloads, in Chromium and WebKit, and
  // in WebKit even then, unless it is fetched again.
  requireSite();
  const files = moduleFiles('src/examples/button/CreateProject.tsx');
  let failing = true;
  await serveSite(page, {
    failing: (pathname) => failing && files.includes(pathname),
    failure: 'missing',
  });
  await page.goto(`${siteUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await expect(hero.getByText('Reloading the page loads the example again.')).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Try again' })).toHaveCount(0);
  failing = false;
  await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
});

/**
 * Opens the overview of the hosted build, then the Button page with every file under /assets/ that
 * the overview had not loaded failing, chosen by when it is asked for rather than by
 * module-files.json, so a file the map leaves out fails too. Returns the hero example, and a
 * setter: `assets` makes every file under /assets/ fail, as when only the map arrives, and `up`
 * serves every file.
 */
async function openFailingButtonPage(page: Page) {
  const loaded = new Set<string>();
  let state: 'opening' | 'failing' | 'assets' | 'up' = 'opening';
  await serveSite(page, {
    failing: (pathname) => {
      if (!pathname.startsWith('/assets/')) return false;
      if (state === 'opening') loaded.add(pathname);
      return state === 'assets' || (state === 'failing' && !loaded.has(pathname));
    },
    failure: 'aborted',
  });
  await page.goto(`${siteUrl}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'envUI' })).toBeVisible();
  await expect(page.locator('.docs-loading')).toHaveCount(0);
  state = 'failing';
  await goTo(page, '/components/button');
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  return { hero, set: (next: 'assets' | 'up') => (state = next) };
}

test("in the hosted build, a reload whose files can't be fetched keeps the page and says so", async ({
  page,
}) => {
  requireSite();
  const { hero, set } = await openFailingButtonPage(page);
  // module-files.json arrives, but none of the files it lists.
  set('assets');
  await page.evaluate(() => Object.assign(window, { stillHere: true }));
  await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(hero.getByRole('status')).toHaveText(
    'The connection seems to be down. Reload the page once it is back.',
  );
  expect(await page.evaluate(() => 'stillHere' in window)).toBe(true);
  set('up');
  await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
});

test('code that fails to load is asked for once, not on every render', async ({ page }) => {
  const source = /\/src\/examples\/button\/CreateProject\.tsx\?raw/;
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (/uncached promise/i.test(message.text())) warnings.push(message.text());
  });
  await page.route(source, (route) => route.abort());
  await page.goto(`${catalogueUrl}/components/button`);
  await page
    .locator('.docs-live-example-entry')
    .first()
    .locator('.docs-live-example-code summary')
    .click();
  // The first figure shares its row, so its code opens below the row.
  const entry = page.getByRole('region', { name: 'Code, CreateProject.tsx', exact: true });
  await expect(entry.getByText('The code could not load')).toBeVisible();
  // The example beside it is not loaded again.
  await expect(
    page.getByRole('group', { name: 'Button example', exact: true }).getByRole('button').first(),
  ).toBeVisible();
  expect(warnings).toEqual([]);
  await page.unroute(source);
  await entry.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(entry.getByText('The code could not load')).toHaveCount(0);
  await expect(entry.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
});

test('a retry returns focus once, and later updates leave focus where it is', async ({ page }) => {
  const example = '**/src/examples/button/CreateProject.tsx*';
  await page.route(example, (route) => route.abort());
  await page.goto(`${catalogueUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await page.unroute(example);
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  expect(await hero.evaluate((group) => group.contains(document.activeElement))).toBe(true);
  // Focus leaves for the page; the theme changes in another window, which moves no focus. The
  // frame's body scrolls, not the document.
  const body = page.locator('#docs-main');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await body.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  const scrolled = await body.evaluate((element) => element.scrollTop);
  expect(scrolled).toBeGreaterThan(1000);
  await page.evaluate((key) => {
    localStorage.setItem(key, 'dark');
    dispatchEvent(
      new StorageEvent('storage', { key, newValue: 'dark', storageArea: localStorage }),
    );
  }, displayStorageKeys.theme);
  await expect(page.locator('.docs-app')).toHaveAttribute('data-env-theme', 'dark');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  expect(await body.evaluate((element) => element.scrollTop)).toBe(scrolled);
});

test('an example that fails to render says so in place, and the rest of the page works', async ({
  page,
}) => {
  await page.route('**/src/examples/button/CreateProject.tsx', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: "export default function CreateProject() { throw new Error('Broken example'); }",
    }),
  );
  await page.goto(`${catalogueUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('This example failed to render')).toBeVisible();
  await expect(hero.getByText('Broken example')).toBeVisible();
  // It is not a failed load, which a retry or a reload could mend.
  await expect(page.getByText('The example could not load')).toHaveCount(0);
  await expect(hero.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  // The other examples and the example's code render.
  const toolbar = page.getByRole('group', { name: 'In a toolbar example', exact: true });
  await expect(toolbar.getByRole('button').first()).toBeVisible();
  await page
    .locator('.docs-live-example-entry')
    .first()
    .locator('.docs-live-example-code summary')
    .click();
  const entry = page.getByRole('region', { name: 'Code, CreateProject.tsx', exact: true });
  await expect(entry.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
  // And the navigation still leads elsewhere.
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Badge', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Badge');
});

test("the overview's hero shows the package's version under the wordmark, and leads to the components", async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/`);
  const hero = page.locator('.docs-overview-hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  // The version is packages/ui/package.json's, as a quiet subheading rather than a link.
  const versionLine = hero.locator('.docs-overview-version');
  await expect(versionLine).toHaveText(`v${version}`);
  await expect(versionLine.getByRole('link')).toHaveCount(0);
  await expect(hero.getByRole('link')).toHaveCount(1);
  await expect(hero.getByRole('link', { name: 'Browse components', exact: true })).toBeVisible();
});

test("the Docs' home gives a prompt to copy that sets envUI up through the skill the site serves", async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(`${catalogueUrl}/docs`);
  const setup = page.getByRole('region', { name: 'Set up with your agent' });
  const prompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';
  await expect(setup).toContainText(prompt);
  await setup.getByRole('button', { name: 'Copy prompt' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
  // The development server serves the skill and llms.txt as the build writes them.
  const skill = await page.request.get(`${catalogueUrl}/SKILL.md`);
  expect(skill.headers()['content-type']).toBe('text/markdown; charset=utf-8');
  expect(await skill.text()).toBe(renderSkill());
  const llms = await page.request.get(`${catalogueUrl}/llms.txt`);
  expect(await llms.text()).toBe(renderLlmsText());
});

test('the Icons page credits Material Symbols with their license, and the footer does not', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/foundations/icons`);
  const credit = page.locator('.docs-icons-credit');
  await expect(credit.getByRole('heading', { name: 'Where the icons come from' })).toBeVisible();
  await expect(credit.getByRole('link', { name: 'Material Symbols' })).toHaveAttribute(
    'href',
    'https://m3.material.io/styles/icons',
  );
  await expect(credit.getByRole('link', { name: 'Apache License 2.0' })).toHaveAttribute(
    'href',
    'https://www.apache.org/licenses/LICENSE-2.0',
  );
  await expect(page.locator('.docs-footer')).not.toContainText('Material Symbols');
});

test('a Related tile of a page without an example shows its specimen', async ({ page }) => {
  // Icon is documented on the Icons foundation's page, which has no example: its tile links there
  // and shows a few of the icons, fitted to its stage as an example is.
  await page.goto(`${catalogueUrl}/components/avatar`);
  const tile = page.locator('.docs-related-tile').filter({ hasText: /^Icon/ });
  await tile.scrollIntoViewIfNeeded();
  await expect(tile.getByRole('link', { name: 'Icon', exact: true })).toHaveAttribute(
    'href',
    '/foundations/icons',
  );
  await expect(tile.locator('.docs-related-stage')).toHaveAttribute('data-specimen', 'icons');
  await expect(tile.locator('.docs-related-canvas[data-fitted] svg')).toHaveCount(6);
  await expect(page.locator('.docs-related-placeholder')).toHaveCount(0);
});

test('every tile of the galleries of components and patterns is fitted, shown whole on its stage', async ({
  page,
}) => {
  // A tile's example loads as it nears the viewport and comes into its canvas after the fit has
  // started to watch it; each must still be fitted, and show what it holds inside its stage.
  const tiles = page.locator('.docs-gallery-tile');
  const unfitted = () =>
    tiles.evaluateAll((items) =>
      items.flatMap((tile) => {
        const name = tile.querySelector('.docs-gallery-name')?.textContent ?? '';
        const stage = tile.querySelector('.docs-related-stage')!.getBoundingClientRect();
        const canvas = tile.querySelector<HTMLElement>('.docs-related-canvas[data-fitted]');
        if (!canvas || !/scale\(/.test(canvas.style.transform)) return [`${name}: not fitted`];
        const shown = [...canvas.querySelectorAll('*')]
          .filter((element) => element.checkVisibility({ visibilityProperty: true }))
          .map((element) => element.getBoundingClientRect())
          .filter((box) => box.width >= 1 && box.height >= 1);
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
    await page.goto(`${catalogueUrl}${route}`);
    await expect(tiles.first()).toBeVisible();
    const count = await tiles.count();
    expect(count).toBeGreaterThan(route === '/components' ? 60 : 10);
    for (let index = 0; index < count; index += 4) await tiles.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(unfitted, { message: route }).toEqual([]);
  }
});

test("every label and heading of the Site's and the Docs' drawers fits on one line at the default width", async ({
  page,
}) => {
  // A fresh page has no width stored, so each drawer starts at its default width.
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of [...siteSections.map((section) => sectionHome(section).path), 'docs']) {
    await page.goto(`${catalogueUrl}/${path}`);
    const drawer = page.locator('.docs-sidebar');
    await expect(drawer.locator('.env-drawer-item').first()).toBeVisible();
    // The drawer keeps each on one line, cut short where it doesn't fit: none may be cut.
    const cut = await drawer
      .locator('.env-drawer-label, .env-drawer-heading')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.scrollWidth > element.clientWidth)
          .map((element) => element.textContent),
      );
    expect(cut, path).toEqual([]);
  }
});

test('the navigation shows the current page, and focus moves to the page only on a route change', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${catalogueUrl}/components/tree`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tree');
  // The rail marks the page's destination, and the drawer beside it lists the destination's pages.
  await expect(
    page.getByRole('navigation', { name: 'Site' }).locator('[aria-current="page"]'),
  ).toHaveText('Components');
  const navigation = page.getByRole('navigation', { name: 'Components' });
  // The current page's link is scrolled into view as the navigation mounts.
  const current = navigation.locator('[aria-current="page"]');
  await expect(current).toHaveText(/Tree/);
  await expect(current).toBeInViewport();
  // The first page loaded leaves focus at the start of the document.
  const main = page.getByRole('main');
  await expect(main).not.toBeFocused();
  await navigation.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(main).toBeFocused();
  // A destination of the rail opens its first page, and the drawer lists its pages.
  await page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link', { name: 'Foundations', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  await expect(
    page.getByRole('navigation', { name: 'Foundations' }).getByRole('link', { name: 'Typography' }),
  ).toBeVisible();
  // The Docs have a navigation of their own, and the top bar leads back to the Site.
  await page.locator('.docs-page-actions').getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI Docs');
  await expect(page.getByRole('navigation', { name: 'Site' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Docs' }).getByRole('link', { name: 'Design tokens' }),
  ).toBeVisible();
  await page.locator('.docs-page-actions').getByRole('link', { name: 'Site', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
});

test("the pager and the drawer open a page at its top, and a section's address at the section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const body = page.locator('#docs-main');
  const bottom = () => body.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  // Select's page shows its list open, partway down; the list scrolling its chosen option into
  // view once moved the whole page there.
  const listShown = () =>
    expect(page.locator('.docs-open-example .env-select-popup').first()).toBeVisible();
  await page.goto(`${catalogueUrl}/components/combobox`);
  await expect(page.locator('.docs-page-navigation')).toBeVisible();
  await bottom();
  await page
    .locator('.docs-page-navigation')
    .getByRole('link', { name: /Select/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
  await listShown();
  await expect(page.locator('.docs-loading')).toHaveCount(0);
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
  // A page chosen in the drawer, from the foot of another, opens at its top too.
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Combobox', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Combobox');
  await bottom();
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Select', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
  await listShown();
  await expect(page.locator('.docs-loading')).toHaveCount(0);
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
  // An address with a section, past the open list, still lands on the section.
  await goTo(page, '/components/combobox');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Combobox');
  await goTo(page, '/components/select#accessibility');
  await listShown();
  await expect(page.locator('.docs-loading')).toHaveCount(0);
  const heading = page.locator('#accessibility');
  await expect
    .poll(() =>
      heading.evaluate(
        (element) =>
          element.getBoundingClientRect().top -
          document.getElementById('docs-main')!.getBoundingClientRect().top,
      ),
    )
    .toBeLessThan(80);
  await expect(heading).toBeInViewport();
});

test('a page that fails to render says so, and the navigation leads to the others', async ({
  page,
}) => {
  await page.route('**/src/pages/Overview.tsx', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: "export function Overview() { throw new Error('Broken page'); }",
    }),
  );
  await page.goto(`${catalogueUrl}/`);
  const main = page.getByRole('main');
  await expect(main.getByText('This page failed to render')).toBeVisible();
  await expect(main.getByText('Broken page')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('envUI');
  // A link to the overview would lead here again; the overview offers a reload instead.
  await expect(main.getByRole('link', { name: 'Return to overview' })).toHaveCount(0);
  await expect(main.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  // The page failed as it opened, the first the catalogue loaded, so focus stays at the start of
  // the document, as on any page that loads.
  await expect(main).not.toBeFocused();
  const navigation = page.getByRole('navigation', { name: 'Site' });
  await navigation.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
  await expect(main.getByText('This page failed to render')).toHaveCount(0);
  await expect(main.getByRole('link', { name: /^Button/ }).first()).toBeVisible();
  // Going back to the page that failed says so again.
  await page.goBack();
  await expect(main.getByText('This page failed to render')).toBeVisible();
});

/**
 * Serves `file` with its export `name` replaced by a button that breaks it: once pressed, the
 * component throws as it renders again. It uses the React that Vite serves the catalogue.
 */
async function breakOnPress(page: Page, file: string, name: string) {
  await page.route(file, async (route) => {
    const original = await (await route.fetch()).text();
    const version = /\/node_modules\/\.vite\/deps\/[\w-]+\.js\?v=(\w+)/.exec(original)?.[1];
    expect(version, `${file} imports Vite's prebundled dependencies`).toBeTruthy();
    await route.fulfill({
      contentType: 'text/javascript',
      // Vite serves React, a CommonJS package, as a default export.
      body: `import React from '/node_modules/.vite/deps/react.js?v=${version}';
        const { createElement, useState } = React;
        function Broken() {
          const [broken, setBroken] = useState(false);
          if (broken) throw new Error('Broken after a press');
          return createElement('button', { type: 'button', onClick: () => setBroken(true) }, 'Break');
        }
        export { Broken as ${name} };`,
    });
  });
}

test('a page that fails after a press takes the focus it dropped, and leads to the overview', async ({
  page,
}) => {
  await breakOnPress(page, '**/src/pages/Catalogue.tsx', 'Catalogue');
  await page.goto(`${catalogueUrl}/components`);
  const main = page.getByRole('main');
  const press = main.getByRole('button', { name: 'Break', exact: true });
  // The page renders with its button, and focus moves to the content once the route has opened.
  await expect(async () => {
    await press.focus();
    await expect(press).toBeFocused({ timeout: 500 });
  }).toPass();
  await page.keyboard.press('Enter');
  const alert = main.locator('.env-alert');
  await expect(alert).toContainText('This page failed to render');
  await expect(alert).toBeFocused();
  await main.getByRole('link', { name: 'Return to overview', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'envUI' })).toBeVisible();
  await expect(alert).toHaveCount(0);
});

test(
  'paths support direct links, old hash links and back/forward navigation',
  { tag: '@engines' },
  async ({ page }) => {
    // The hash address of an earlier release, such as a bookmark, is redirected to its path.
    await page.goto(`${catalogueUrl}/#/components/select/props`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    await page.getByRole('link', { name: 'See it on the Site', exact: true }).click();
    await expect(page).toHaveURL(/\/components\/select$/);
    await page.getByRole('link', { name: 'API', exact: true }).click();
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/components\/select$/);
    await expect(page.locator('.docs-figure-section').first()).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    await expect(page.getByRole('heading', { name: 'Props', exact: true })).toBeVisible();
  },
);

test('the theme in the Display menu switches the whole page and keeps the canvas full height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${catalogueUrl}/components/checkbox/preview`);
  const app = page.locator('.docs-app');
  const panes = page.locator('.docs-preview');
  // The 0.x preview opens the Checkbox page, whose live example follows the theme with its state.
  const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
  const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'dark');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveCount(1);
  await expect(archived).toBeChecked();
  await expect(page.locator('.docs-theme-label')).toHaveCount(0);

  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 1400 });
    // The content fills the frame's body, which fills the window below the top bar.
    const canvas = await page.locator('.docs-main').evaluate((main) => {
      const body = main.closest('.env-scaffold-body')!;
      return {
        height: main.getBoundingClientRect().height,
        body: body.clientHeight,
        bottom: body.getBoundingClientRect().bottom,
        background: getComputedStyle(main).backgroundImage,
      };
    });
    expect(canvas.height).toBeGreaterThanOrEqual(canvas.body - 1);
    expect(Math.abs(canvas.bottom - 1400)).toBeLessThan(1);
    expect(canvas.background).toBe('none');
  }

  await page.setViewportSize({ width: 1920, height: 1000 });
  await goTo(page, '/foundations/colors');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'dark');
  // The role swatches show each role in the reader's theme, and follow it.
  const pageSwatch = panes.first().locator('.docs-role-swatch > span').first();
  const swatchColor = () =>
    pageSwatch.evaluate((swatch) => getComputedStyle(swatch).backgroundColor);
  const darkColor = await swatchColor();
  await chooseScheme(page, 'light');
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'light');
  await expect.poll(swatchColor).not.toBe(darkColor);
  await chooseScheme(page, 'dark');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  // The setup guide, in the Docs, keeps the theme.
  await goTo(page, '/getting-started');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
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
  await page.goto(`${catalogueUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    const rooms = page.locator('.docs-open-example');
    await expect(rooms.first()).toBeVisible();
    await expect(page.locator('.docs-loading')).toHaveCount(0);
    // Every open figure shows an overlay, inside its stage, and is a picture: inert.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            [...document.querySelectorAll<HTMLElement>('.docs-open-example')].flatMap((room) => {
              const stage = room
                .closest('.docs-live-example, .docs-verdict-stage, .docs-anatomy-stage')!
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
            }),
          ),
        { message: `${id}: open figures` },
      )
      .toEqual([]);
    // No figure took focus or locked the page.
    expect(
      await page.evaluate(() => ({
        focusInFigure: !!document.activeElement?.closest('.docs-open-example'),
        locked: [document.documentElement, document.body].some(
          (element) => getComputedStyle(element).overflow === 'hidden',
        ),
        hidden: !!document.querySelector('main [aria-hidden="true"] .docs-figures'),
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
  await page.goto(`${catalogueUrl}/components/toast`);
  await expect(page.locator('.docs-open-example .env-toast').first()).toBeVisible();
  // While no notification of the page is open, F6 is the browser's: the figures' notices, which
  // are pictures, don't take it.
  await page.evaluate(() =>
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F6') document.body.dataset.f6Prevented = String(event.defaultPrevented);
    }),
  );
  await page.keyboard.press('F6');
  await expect(page.locator('body')).toHaveAttribute('data-f6-prevented', 'false');
  await page.getByRole('button', { name: 'Save changes' }).first().click();
  const live = page
    .locator('.env-toast-viewport:not(.docs-open-example .env-toast-viewport)')
    .filter({ has: page.locator('.env-toast') });
  await expect(live).toHaveCount(1);
  await page.keyboard.press('F6');
  await expect(live).toBeFocused();
});

test("the Docs' Changelog page lists each release's highlights, newest first, and their links reach sections of the Docs", async ({
  page,
}) => {
  const releases = readReleaseNotes();
  // The Site's old address opens it.
  await page.goto(`${catalogueUrl}/changelog`);
  await expect(page).toHaveURL(`${catalogueUrl}/docs/changelog`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Changelog');
  await expect(page.getByRole('heading', { level: 2, name: 'Highlights' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Every change' })).toBeVisible();
  const versions = page.locator('.docs-releases h3 .docs-release-version');
  await expect(versions).toHaveText(releases.map((release) => release.version));

  // Every link of the notes leads to a page of the Docs with the section it names.
  const hrefs = await page
    .locator('.docs-releases a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  const sections = new Map<string, Set<string>>();
  for (const href of hrefs) {
    expect(href, href).toMatch(/^\/docs\/(?:migration|changelog)(?:#|$)/);
    const [path, section] = href.split('#');
    sections.set(path, new Set([...(sections.get(path) ?? []), ...(section ? [section] : [])]));
  }
  expect([...sections.keys()].sort()).toEqual(['/docs/changelog', '/docs/migration']);
  for (const [path, ids] of sections) {
    await page.goto(`${catalogueUrl}${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const id of ids)
      await expect(page.locator(`[id="${id}"]`), `${path}#${id}`).toBeAttached();
  }
});
