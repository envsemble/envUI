import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, siteUrl } from './HostedSite';
import { chooseScheme } from './CatalogueThemes';
import { readFileSync } from 'node:fs';
import { readMap } from '../../packages/codemods/src/map.mjs';
import { readBenchmark } from '../../scripts/BenchmarkResults.mjs';
import { readReleaseNotes } from '../../scripts/ReleaseNotes.mjs';
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
    'overview/components': 'overview',
    'overview/components?section=components-actions': 'components?section=components-actions',
    'overview/get-started': 'docs/setup',
    'overview/get-started?skill=migrate&section=local-development': 'docs/agent-skills',
    'get-started/migration': 'docs/migration',
    // The Site's Get started page is the setup guide.
    'get-started': 'docs/setup',
    'contributing/library-development': 'overview',
    // The Site's changelog is the Docs' now, with its release notes.
    changelog: 'docs/changelog',
    'changelog?section=release-0-7-0': 'docs/changelog?section=release-0-7-0',
  };
  for (const [from, to] of Object.entries(routes)) expect(normalizeRoute(from), from).toBe(to);
  // Every page of both areas is its own route.
  for (const { path } of allPages) expect(normalizeRoute(path)).toBe(path);
});

test("a foundation's guide in the Docs renders shared Markdown and follows relative links", async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/docs/foundations/composition`);
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
  await page.goto(`${catalogueUrl}/foundations/colors`);
  const app = page.locator('.docs-app');
  const canvasValue = () =>
    app.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--env-color-bg-page').trim(),
    );
  const initialLight = await canvasValue();
  const swatch = page.getByRole('button', { name: 'Pick page background color', exact: true });
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
  const destinations = page.getByRole('group', { name: 'Button links example', exact: true });
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

test("the Colors page's forced interaction states paint what the components' own states paint", async ({
  page,
}) => {
  // The samples take each state's color through public color properties. A component's own hover
  // and press, forced on its rest sample, must paint the same, so the page can't drift from it.
  await page.goto(`${catalogueUrl}/foundations/colors`);
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  const table = page.getByRole('region', { name: 'Interaction states', exact: true });
  await expect(table).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const nodes = async (selector: string) =>
    (await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector })).nodeIds;
  const samples = {
    'List row': ['.env-list-item', 'background-color'],
    'Navigation item': ['.env-drawer-item', 'background-color'],
    Field: ['.env-text-field-control', 'border-top-color'],
    'Primary button': ['.env-button', 'background-color'],
    'Secondary button': ['.env-button', 'background-color'],
    'Outline button': ['.env-button', 'background-color'],
    'Ghost button': ['.env-button', 'background-color'],
  } as const;
  for (const [sample, [part, property]] of Object.entries(samples)) {
    const cells = table.getByRole('row', { name: sample, exact: false }).getByRole('cell');
    const paint = (cell: number) =>
      cells
        .nth(cell)
        .locator(part)
        .first()
        .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);
    await cells
      .nth(0)
      .locator(part)
      .first()
      .evaluate((element) => element.setAttribute('data-forced-target', ''));
    const [target] = await nodes('[data-forced-target]');
    // A row is pressed through its target, which the row's style reads.
    const inner = await nodes('[data-forced-target] [data-row-target]');
    for (const [cell, state] of [
      [1, ['hover']],
      [2, ['hover', 'active']],
    ] as const) {
      await cdp.send('CSS.forcePseudoState', { nodeId: target!, forcedPseudoClasses: [...state] });
      for (const nodeId of inner)
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [...state] });
      expect(await paint(0), `${sample}, ${state.join(' and ')}`).toBe(await paint(cell));
    }
    await cdp.send('CSS.forcePseudoState', { nodeId: target!, forcedPseudoClasses: [] });
    for (const nodeId of inner)
      await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    await cells
      .nth(0)
      .locator(part)
      .first()
      .evaluate((element) => element.removeAttribute('data-forced-target'));
  }
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
  await expect(page.locator('.docs-figure-section-heading h2')).toHaveText([
    'Overview',
    'Variants',
    'When to use',
    'Anatomy',
    'Adapting to width',
    'Accessibility',
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
  // When to use is a plain list; Related, at the end, has a tile for each alternative, of one
  // size, each a picture of it, inert and fitted to its stage, once the section nears the viewport.
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
  // The anatomy numbers each part of the live button beside the part it names, in the examples'
  // theme, the one opposite the reader's, and keeps them there as the page narrows and the theme
  // changes.
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
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await chooseScheme(page, 'dark');
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'light' });
  await page.setViewportSize({ width: 420, height: 800 });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'light' });
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
  // frame, which holds its stage and its verdict bar, is the figure's one frame. A stage is in the
  // examples' theme, so it differs from the page; a box filled with the page's color, such as the
  // theme boundary around a specimen, is the page, not a frame.
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
      const figures = document.querySelector('.docs-figures')!;
      const pageColor = getComputedStyle(figures.closest('.env-theme')!).backgroundColor;
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
            (visible(style.backgroundColor) &&
              style.backgroundColor !== canvas &&
              style.backgroundColor !== pageColor) ||
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
  ).toContainText('Changelog');
  for (const { path, title, kind } of allPages) {
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    await expect(page.getByText('This page failed to render')).toHaveCount(0);
  }
  // A deep link loads its page, in the Docs too.
  await page.goto(`${siteUrl}/docs/setup`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Inter"'))).toBe(true);
});

test('single previews retain state when the theme changes', async ({ page }) => {
  // The 0.x preview of text fields opens the TextField page, whose live examples take the theme
  // opposite the documentation's.
  await page.goto(`${catalogueUrl}/components/input/preview`);
  const example = page.getByRole('group', { name: 'TextField example', exact: true });
  const projectName = example.getByRole('textbox', { name: 'Project name', exact: true });
  await projectName.fill('Winter release');
  await chooseScheme(page, 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'light');
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
  await expect(disclosure).toHaveAttribute('data-env-theme', 'light');
  await expect(disclosure.locator('details')).toHaveAttribute('open', '');
});

test('arrowing between the agent skills keeps focus on the tabs and adds no history', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/docs/setup`);
  await page.goto(`${catalogueUrl}/docs/agent-skills?skill=migrate`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Agent skills');
  const before = await page.evaluate(() => history.length);
  const tabs = page.getByRole('tablist', { name: 'Agent skills', exact: true });
  await tabs.getByRole('tab', { name: 'Migrate to envUI', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.getByRole('tab', { name: 'Use envUI', exact: true })).toBeFocused();
  expect(await page.evaluate(() => `${location.pathname}${location.search}`)).toBe(
    '/docs/agent-skills?skill=use',
  );
  expect(await page.evaluate(() => history.length)).toBe(before);
  // Back leaves the page rather than stepping through the skills passed on the way.
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
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
  const toolbar = page.getByRole('group', { name: 'Quiet toolbar example', exact: true });
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

test("the overview's hero shows the package's version under the wordmark, and says what envUI is", async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/`);
  const hero = page.locator('.docs-overview-hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  // The version is packages/ui/package.json's, as a quiet subheading rather than a link.
  const versionLine = hero.locator('.docs-overview-version');
  await expect(versionLine).toHaveText(`v${version}`);
  await expect(versionLine.getByRole('link')).toHaveCount(0);
  await expect(hero).toContainText('envUI is a design system for React apps.');
  for (const name of ['Browse components', 'Read the Docs'])
    await expect(hero.getByRole('link', { name, exact: true })).toBeVisible();
});

test('the footer of the Site and the Docs credits Material Symbols with their license', async ({
  page,
}) => {
  for (const path of ['', 'docs']) {
    await page.goto(`${catalogueUrl}/${path}`);
    const credit = page.locator('.docs-footer-credit');
    await expect(credit, path).toHaveText(
      'Icons are Material Symbols, under the Apache License 2.0.',
    );
    await expect(credit.getByRole('link', { name: 'Apache License 2.0' })).toHaveAttribute(
      'href',
      'https://www.apache.org/licenses/LICENSE-2.0',
    );
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('envUI Docs');
  await expect(page.getByRole('navigation', { name: 'Site' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Docs' }).getByRole('link', { name: 'Design tokens' }),
  ).toBeVisible();
  await page.locator('.docs-page-actions').getByRole('link', { name: 'Site', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
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
  // The 0.x preview opens the Checkbox page, whose live example takes the opposite theme and keeps
  // its state.
  const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
  const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'dark');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'light');
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
  await expect(panes.first().locator('.docs-swatch code').first()).toHaveText(/^#[0-9a-f]{6}$/);
  const swatches = await panes.evaluateAll((columns) =>
    columns.map((column) => {
      const label = column.querySelector('.docs-palette-label')!.getBoundingClientRect();
      const swatch = column.querySelector('.docs-swatch')!.getBoundingClientRect();
      return { label: label.x, swatch: swatch.x, left: swatch.left, right: swatch.right };
    }),
  );
  expect(swatches[0].swatch).toBeGreaterThan(swatches[0].label);
  expect(swatches).toHaveLength(1);
  const darkColor = await panes.locator('.docs-swatch code').first().textContent();
  await chooseScheme(page, 'light');
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.locator('.docs-swatch code').first()).not.toHaveText(darkColor!);
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

test("the Benchmark page shows the newest run's scores and a named chart with its data as a table", async ({
  page,
}) => {
  const { latest, runs } = readBenchmark();
  await page.goto(`${catalogueUrl}/benchmark`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Benchmark');
  await expect(page.getByRole('heading', { name: 'Latest run', level: 2 })).toBeVisible();
  const scores = page.getByRole('table', { name: `Scores of run ${latest.id}` });
  await expect(scores.getByRole('row')).toHaveCount(latest.agents.length + 1);
  for (const agent of latest.agents)
    await expect(scores.getByRole('row', { name: agent.label })).toContainText(String(agent.mean));

  // The chart is one image, named by its caption and described by every bar's value.
  const chart = page.getByRole('img', { name: /^Mean score out of 100 by run and agent/ });
  await expect(chart).toBeVisible();
  await expect(chart).toHaveAccessibleDescription(new RegExp(latest.id));
  // Its data is a table too, one row per agent of each run.
  await page.getByText("The chart's data as a table").click();
  const data = page.getByRole('table', { name: 'Mean score by run and agent' });
  await expect(data).toBeVisible();
  const bars = runs.reduce((count, run) => count + run.agents.length, 0);
  await expect(data.getByRole('row')).toHaveCount(bars + 1);
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
