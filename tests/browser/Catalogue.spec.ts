import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, siteUrl } from './HostedSite';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readMap } from '../../packages/codemods/src/map.mjs';
import { documentedVersion } from '../../scripts/GenerateDocumentation.mjs';
import {
  references,
  foundations as foundationReferences,
} from '../../apps/catalogue/src/Reference';
import {
  normalizeRoute,
  referencePages,
  viewFor,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;
const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;
const components = references.map(({ id }) => id);
const foundations = foundationReferences.map(({ id }) => id);

test('the 0.x routes of renamed pages open the pages under their new names', () => {
  const { docs } = readMap() as { docs: Record<string, string> };
  for (const [from, to] of Object.entries<string>(docs).filter(([key]) => !key.startsWith('$'))) {
    expect(components).toContain(to);
    expect(components).not.toContain(from);
    const reference = references.find(({ id }) => id === to)!;
    // A page on the template opens Overview for a Preview link and Guidelines for a Usage link.
    for (const view of ['preview', 'usage'])
      expect(normalizeRoute(`components/${from}/${view}`)).toBe(
        `components/${to}/${viewFor(reference, view)}`,
      );
  }
});

test('offline usage renders shared Markdown guidance and follows relative topic links', async ({
  page,
}) => {
  await page.goto(`${offline}#/foundations/composition/usage`);
  await expect(
    page.getByRole('heading', { name: 'Build from existing primitives', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Surface supplies fill, padding and corners.', { exact: false }),
  ).toBeVisible();
  await page.locator('.docs-article').getByRole('link', { name: 'Surface', exact: true }).click();
  // Surface is on the template, so a link to its page opens Overview.
  await expect(page).toHaveURL(/#\/components\/surface\/overview$/);
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();

  // A guide in the index opens on a page of its own, in its section of the navigation.
  await page.goto(`${offline}#/overview/get-started`);
  await page
    .locator('#documentation')
    .getByRole('link', { name: 'Develop envUI locally', exact: true })
    .click();
  await expect(page).toHaveURL(/#\/get-started\/local-development$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Develop envUI locally');
  await expect(page.locator('.docs-article')).toContainText('npm run dev:library');
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Develop envUI locally', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  // The address it had on the Get started view leads to the same page.
  await page.goto(`${offline}#/overview/get-started?document=migration&section=documentation`);
  await expect(page).toHaveURL(/#\/get-started\/migration$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Migrate an interface to envUI');
});

test('palette editing uses public controls and remains temporary and independent between themes', async ({
  page,
}) => {
  await page.goto(`${offline}#/foundations/colors/preview`);
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
  await dialog.getByRole('textbox', { name: 'Page background HEX' }).fill('123456');
  await expect.poll(canvasValue).toBe('#123456');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  expect(await canvasValue()).not.toBe('#123456');
  await swatch.click();
  await dialog.getByRole('textbox', { name: 'Page background HEX' }).fill('#abcdef');
  await expect.poll(canvasValue).toBe('#abcdef');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect.poll(canvasValue).toBe('#123456');
  await page.reload();
  await expect.poll(canvasValue).toBe(initialLight);
});

test('live examples keep links in place, show their source, and specimens show forced states', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/button/overview`);
  const hash = await page.evaluate(() => location.hash);
  // Links in an example keep their semantics without leaving the documentation.
  const destinations = page.getByRole('group', { name: 'Button links example', exact: true });
  await destinations.getByRole('link', { name: 'Read the guide', exact: true }).press('Enter');
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  await destinations
    .getByRole('link', { name: 'Read help', exact: true })
    .click({ modifiers: ['Control'] });
  expect(await page.evaluate(() => location.hash)).toBe(hash);
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
  // illustrate on the figure template, and in the guidelines on the section template.
  await expect(page.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
  await page.goto(`${offline}#/components/nav-list/guidelines`);
  const navigationDisclosure = page.locator('.docs-preview details.env-disclosure');
  await navigationDisclosure.locator('summary').click();
  await expect(
    navigationDisclosure.getByRole('region', { name: 'Navigation item interaction states' }),
  ).toBeVisible();
});

test('a component page shows plain sections, equal cells and the parts of its anatomy', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/button/overview`);
  // Every section is in the Overview; the props have a view of their own.
  await expect(page.getByRole('tab')).toHaveText(['Overview', 'Props']);
  // Ordinary headings in the fixed order, and no questions.
  await expect(page.locator('.docs-figure-section-heading h2')).toHaveText([
    'Overview',
    'Variants',
    'When to use',
    'Anatomy',
    'Adapting to width',
    'Accessibility',
    'Props',
  ]);
  await expect(page.locator('.docs-figures .env-message')).toHaveCount(0);
  // Figures that share a row are cells of one size: equal widths, and stages as tall as the
  // tallest.
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
  // The anatomy numbers each part of the live button beside the part it names, in the theme the
  // reader has chosen alone, and keeps them there as the page narrows and the theme changes.
  const stages = page.locator('.docs-anatomy-stage');
  await expect(stages).toHaveCount(1);
  const placement = () =>
    stages.evaluate((stage) => {
      const icon = stage.querySelector('.env-button > .env-icon')!.getBoundingClientRect();
      const badge = [...stage.querySelectorAll('.docs-anatomy-badge')]
        .find((item) => item.textContent === '2')!
        .getBoundingClientRect();
      return {
        badges: stage.querySelectorAll('.docs-anatomy-badge').length,
        // Centred on the icon, give or take the rounding of a centred stage.
        aligned: Math.abs(badge.left + badge.width / 2 - (icon.left + icon.width / 2)) <= 1,
        theme: stage.getAttribute('data-env-theme'),
      };
    });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'light' });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await page.setViewportSize({ width: 420, height: 800 });
  await expect.poll(placement).toEqual({ badges: 4, aligned: true, theme: 'dark' });
  await expect(page.locator('.docs-anatomy-legend > li')).toHaveCount(4);
});

test('every anatomy figure numbers each part its legend names', async ({ page }) => {
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
  await page.goto(`${catalogueUrl}/#/overview`);
  for (const { id, figures } of pages) {
    await page.evaluate((hash) => {
      location.hash = hash;
    }, `/components/${id}/overview`);
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

test('the props view links each source file at the revision the catalogue was built from', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/button/props`);
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

test('offline reference loads every view without network or script errors', async ({
  page,
  context,
}) => {
  // It opens every view of every page, which takes most of the default 30 s on a busy machine.
  test.slow();
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`${offline}#/overview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(page.locator('.docs-footer')).toContainText(`envUI ${documentedVersion()}`);
  // Every view of every page: Preview and Usage, or the views of a page on the template.
  for (const { path, views } of referencePages) {
    for (const view of views) {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, `/${path}/${view.id}`);
      await expect(
        page.locator('.docs-page-header').getByRole('tab', { selected: true }),
      ).toHaveText(view.title);
      if (view.id === 'preview') await expect(page.locator('.docs-preview')).toHaveCount(1);
    }
  }
  expect(referencePages.length).toBe(components.length + foundations.length);
  await page.evaluate(() => {
    location.hash = '/getting-started/usage';
  });
  await expect(page.getByRole('tab', { name: 'Get started', selected: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install the private package' })).toBeVisible();
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Inter"'))).toBe(true);
});

test('single previews retain state when the theme changes', async ({ page }) => {
  // The 0.x preview of text fields opens the TextField page, whose live examples follow the
  // documentation's theme.
  await page.goto(`${offline}#/components/input/preview`);
  const example = page.getByRole('group', { name: 'TextField example', exact: true });
  const projectName = example.getByRole('textbox', { name: 'Project name', exact: true });
  await projectName.fill('Winter release');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
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
  const mobileNavigation = page.getByRole('dialog', { name: 'Documentation', exact: true });
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
  await page.evaluate(() => {
    location.hash = '/components/checkbox/preview';
  });
  const archived = page
    .getByRole('group', { name: 'Checkbox example', exact: true })
    .getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(archived).toBeChecked();
  // The 0.x route of disclosures opens the Disclosure page, whose live example keeps its state.
  await page.evaluate(() => {
    location.hash = '/components/notes/preview';
  });
  const disclosure = page.getByRole('group', { name: 'Disclosure example', exact: true });
  await disclosure.locator('summary').click();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(disclosure).toHaveAttribute('data-env-theme', 'dark');
  await expect(disclosure.locator('details')).toHaveAttribute('open', '');
});

test('arrowing between views keeps focus on the tabs and adds no history', async ({ page }) => {
  await page.goto(`${offline}#/components/link/overview`);
  await page.goto(`${offline}#/components/menu/accessibility?section=keyboard`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Menu');
  const before = await page.evaluate(() => history.length);
  const tabs = page.getByRole('tablist', { name: 'Menu reference views', exact: true });
  await tabs.getByRole('tab', { name: 'Accessibility', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.getByRole('tab', { name: 'Guidelines', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.getByRole('tab', { name: 'Overview', exact: true })).toBeFocused();
  expect(await page.evaluate(() => location.hash)).toBe('#/components/menu/overview');
  expect(await page.evaluate(() => history.length)).toBe(before);
  // Back leaves the page rather than stepping through the views passed on the way.
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Link');
});

test('the views of a page stay in sight on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${offline}#/components/menu/overview`);
  const tabs = page.getByRole('tablist', { name: 'Menu reference views', exact: true });
  for (const name of ['Overview', 'Guidelines', 'Accessibility', 'Props']) {
    const box = await tabs.getByRole('tab', { name, exact: true }).boundingBox();
    expect(box, name).not.toBeNull();
    expect(box!.x, name).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, name).toBeLessThanOrEqual(390);
  }
});

test('an example that fails to load says so in place, and loads again on request', async ({
  page,
}) => {
  const example = '**/src/examples/button/CreateProject.tsx*';
  await page.route(example, (route) => route.abort());
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
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
  await page.goto(`${siteUrl}/#/components/button/overview`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await expect(hero.getByText('Reloading the page loads the example again.')).toBeVisible();
  await expect(hero.getByRole('button', { name: 'Try again' })).toHaveCount(0);
  failing = false;
  await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
});

test("in the hosted build, a template page's previews load in the site's own frames", async ({
  page,
}) => {
  // The previews are iframes of the site's frame route, ?frame=, so the site's framing headers in
  // _headers must allow its own origin: X-Frame-Options DENY left them blank.
  requireSite();
  await serveSite(page);
  await page.goto(`${siteUrl}/templates/index-page`);
  const frames = page.locator('iframe.docs-template-frame');
  await expect(frames.first()).toBeVisible();
  for (const frame of await frames.all()) {
    await frame.scrollIntoViewIfNeeded();
    await expect(
      page.frameLocator(`iframe[title="${await frame.getAttribute('title')}"]`).locator('main'),
    ).toBeVisible();
  }
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
  await page.goto(`${siteUrl}/#/overview`);
  await expect(page.getByRole('heading', { level: 1, name: 'envUI' })).toBeVisible();
  await expect(page.getByText(/^Loading .*…$/)).toHaveCount(0);
  state = 'failing';
  await page.evaluate(() => (window.location.hash = '#/components/button/overview'));
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

/** A build's script with the overview made to throw as it renders, where it is in the script. */
const breakOverview = (script: string) =>
  script.replace(/(["'`])Overview views\1/, '(() => { throw new Error("Broken page"); })()');

test('the offline catalogue reloads from an overview that failed, also without a connection', async ({
  page,
}, testInfo) => {
  // A file opened from disk reloads from disk, whatever the browser says of the connection. The
  // browser says it is offline here; WebKit's emulated offline mode would block the file too.
  await page.addInitScript(() =>
    Object.defineProperty(Navigator.prototype, 'onLine', { get: () => false }),
  );
  const html = readFileSync(resolve('dist/envUI.html'), 'utf8');
  const broken = breakOverview(html);
  expect(broken, 'the overview in dist/envUI.html').not.toBe(html);
  const file = testInfo.outputPath('envUI.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, broken);
  await page.goto(`${pathToFileURL(file).href}#/overview`);
  const main = page.getByRole('main');
  await expect(main.getByText('Broken page')).toBeVisible();
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  await page.evaluate(() => Object.assign(window, { stillHere: true }));
  await Promise.all([
    page.waitForEvent('load', { timeout: 10_000 }),
    main.getByRole('button', { name: 'Reload the page', exact: true }).click(),
  ]);
  expect(await page.evaluate(() => 'stillHere' in window)).toBe(false);
  await expect(main.getByText('Broken page')).toBeVisible();
});

test('code that fails to load is asked for once, not on every render', async ({ page }) => {
  const source = /\/src\/examples\/button\/CreateProject\.tsx\?raw/;
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (/uncached promise/i.test(message.text())) warnings.push(message.text());
  });
  await page.route(source, (route) => route.abort());
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
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
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await page.unroute(example);
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  expect(await hero.evaluate((group) => group.contains(document.activeElement))).toBe(true);
  // Focus leaves for the page; the theme changes with a click that moves no focus.
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  const scrolled = await page.evaluate(() => window.scrollY);
  expect(scrolled).toBeGreaterThan(1000);
  await page
    .locator('.docs-page-controls')
    .getByRole('button', { name: /^Switch to/ })
    .evaluate((toggle: HTMLElement) => toggle.click());
  await expect(page.locator('.docs-app')).toHaveAttribute('data-env-theme', 'dark');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
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
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('This example failed to render')).toBeVisible();
  await expect(hero.getByText('Broken example')).toBeVisible();
  // It is not a failed load, which a retry or a reload could mend.
  await expect(page.getByText('The example could not load')).toHaveCount(0);
  await expect(hero.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  // The other examples and the example's code render.
  const variants = page.getByRole('group', { name: 'Variants example', exact: true });
  await expect(variants.getByRole('button').first()).toBeVisible();
  await page
    .locator('.docs-live-example-entry')
    .first()
    .locator('.docs-live-example-code summary')
    .click();
  const entry = page.getByRole('region', { name: 'Code, CreateProject.tsx', exact: true });
  await expect(entry.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
  // And the navigation still leads elsewhere.
  await page
    .getByRole('navigation', { name: 'Documentation' })
    .first()
    .getByRole('link', { name: 'Badge', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Badge');
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
  await page.goto(`${catalogueUrl}/#/overview`);
  const main = page.getByRole('main');
  await expect(main.getByText('This page failed to render')).toBeVisible();
  await expect(main.getByText('Broken page')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('envUI');
  // A link to the overview would lead here again; the overview offers a reload instead.
  await expect(main.getByRole('link', { name: 'Return to overview' })).toHaveCount(0);
  await expect(main.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  // The page failed as it opened, so focus stays where the route put it.
  await expect(main).toBeFocused();
  const navigation = page.getByRole('navigation', { name: 'Documentation' }).first();
  await navigation.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(main.getByText('This page failed to render')).toHaveCount(0);
  await expect(
    page
      .getByRole('group', { name: 'Button example', exact: true })
      .getByRole('button', { name: 'Create project', exact: true }),
  ).toBeVisible();
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
  await breakOnPress(page, '**/src/pages/ReferenceContent.tsx', 'ReferenceContent');
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
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
  'offline hashes support direct links and back/forward navigation',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${offline}#/components/select/guidelines`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
    await page.getByRole('tab', { name: 'Overview', exact: true }).click();
    await page.getByRole('tab', { name: 'Guidelines', exact: true }).click();
    await page.goBack();
    await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
      'Overview',
    );
    await page.goForward();
    await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
      'Guidelines',
    );
  },
);

test('offline theme toggle switches the whole page and keeps the canvas full height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${offline}#/components/checkbox/preview`);
  const app = page.locator('.docs-app');
  const panes = page.locator('.docs-preview');
  // The 0.x preview opens the Checkbox page, whose live example follows the theme with its state.
  const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
  const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveCount(1);
  await expect(archived).toBeChecked();
  await expect(page.locator('.docs-theme-label')).toHaveCount(0);

  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 1400 });
    const canvas = await page.locator('.docs-main').evaluate((main) => {
      const rect = main.getBoundingClientRect();
      return {
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
        background: getComputedStyle(main).backgroundImage,
      };
    });
    expect(canvas.height).toBeGreaterThanOrEqual(1400);
    expect(Math.abs(canvas.bottom - canvas.documentHeight)).toBeLessThan(1);
    expect(canvas.background).toBe('none');
  }

  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.evaluate(() => {
    location.hash = '/foundations/colors';
  });
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
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'light');
  await expect(panes.locator('.docs-swatch code').first()).not.toHaveText(darkColor!);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await page.evaluate(() => {
    location.hash = '/getting-started';
  });
  await expect(page.getByRole('tab', { name: 'Get started', selected: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install the private package' })).toBeVisible();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
});
