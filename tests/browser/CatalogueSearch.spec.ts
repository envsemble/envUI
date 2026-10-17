/**
 * The catalogue's search, navigation and display settings: search in envUI's CommandPalette, opened
 * with ⌘K or Ctrl+K, hosted and offline; path routes in the hosted build, served through the
 * hosted Worker script, with deep links, refreshes and the old hash addresses; hash routes in the
 * offline catalogue; and the theme, contrast and scale the Display menu stores.
 */
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, site, siteUrl } from './HostedSite';
import {
  findReferencePage,
  findStandalonePage,
  normalizeRoute,
  routeOfDocument,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';
import { readDocumentation, readProps } from '../../scripts/GenerateDocumentation.mjs';
import { cataloguePages, readTokens, searchDocuments } from '../../scripts/SearchIndex.mjs';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;

type SearchRecord = { id: string; page: string; view?: string; section?: string };
let records: SearchRecord[] | undefined;
/** What search can find, as the index is built from it, with the catalogue's own pages. */
function searchRecords() {
  if (records) return records;
  const props = readProps();
  const documents = readDocumentation(undefined, { props });
  records = [
    ...cataloguePages.map(({ page }: { page: string }) => ({ id: `page:${page}`, page })),
    ...searchDocuments({ documents, props, tokens: readTokens() }),
  ];
  return records;
}

/** The route a result opens. */
function routeOfResult(id: string) {
  const record = searchRecords().find((entry) => entry.id === id)!;
  return routeOfDocument(record.page, { view: record.view, section: record.section })!;
}

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Search the documentation' });
const field = (page: Page) =>
  dialog(page).getByRole('combobox', { name: 'Search the documentation' });
const option = (page: Page, id: string) => dialog(page).locator(`[data-item-id="${id}"]`);

/** The item id of the highlighted result. */
function highlighted(page: Page) {
  return field(page).evaluate(
    (input) =>
      document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.dataset.itemId ??
      null,
  );
}

/** The search shortcut's modifier where the page runs: ⌘ on Apple platforms, Ctrl elsewhere. */
async function shortcutKeys(page: Page) {
  const apple = await page.evaluate(() => /Mac|iPhone|iPad/.test(navigator.userAgent));
  return apple
    ? { own: 'Meta+k', other: 'Control+k', named: 'Meta+K' }
    : { own: 'Control+k', other: 'Meta+k', named: 'Control+K' };
}

/** Opens search with the shortcut and types a query, once the index has loaded. */
async function search(page: Page, query: string) {
  await page.keyboard.press((await shortcutKeys(page)).own);
  await expect(field(page)).toBeFocused();
  await expect(dialog(page).getByText('Loading search…')).toHaveCount(0);
  await field(page).fill(query);
}

async function openCatalogue(page: Page, address: string) {
  await page.goto(address);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test.describe('search', () => {
  test('Ctrl+K, or ⌘K on Apple platforms, opens and closes search, and so does its button', async ({
    page,
  }) => {
    await openCatalogue(page, `${catalogueUrl}/`);
    const keys = await shortcutKeys(page);
    await page.keyboard.press(keys.own);
    await expect(dialog(page)).toBeVisible();
    await expect(field(page)).toBeFocused();
    await expect(dialog(page)).toContainText('Search components and their aliases');
    await page.keyboard.press(keys.own);
    await expect(dialog(page)).toBeHidden();
    // The other platform's modifier leaves the keys to the page, such as Ctrl+K in a Mac text field.
    await page.keyboard.press(keys.other);
    await expect(dialog(page)).toBeHidden();
    await page.keyboard.press(keys.own);
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();

    const button = page
      .locator('.docs-sidebar')
      .getByRole('button', { name: /^Search/ })
      .first();
    await expect(button).toHaveAttribute('aria-keyshortcuts', keys.named);
    // Opened from the keyboard, as some engines do not focus a clicked button.
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(field(page)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('finds a component by an alias and opens its page, with focus on the content', async ({
    page,
  }) => {
    await openCatalogue(page, `${catalogueUrl}/components/badge/overview`);
    await search(page, 'text box');
    await expect(option(page, 'page:text-field')).toBeVisible();
    await expect.poll(() => highlighted(page)).toBe('page:text-field');
    await expect(option(page, 'page:text-field')).toHaveAccessibleName(/^TextField/);
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(`${catalogueUrl}/components/text-field/overview`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('TextField');
    await expect(page.locator('#docs-main')).toBeFocused();
    // An old name of a page finds it as well.
    await search(page, 'AppShellSkeleton');
    await expect.poll(() => highlighted(page)).toBe('page:app-shell');
  });

  test('finds a prop and opens the Props view at its row', async ({ page }) => {
    await openCatalogue(page, `${catalogueUrl}/`);
    await search(page, 'start icon');
    const result = option(page, 'prop:Button.startIcon');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Button prop');
    await expect(dialog(page).getByRole('group', { name: 'Props' })).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(`${catalogueUrl}/components/button/props#props-Button-startIcon`);
    await expect(page.getByRole('tab', { name: 'Props', selected: true })).toBeVisible();
    await expect(page.locator('[id="props-Button-startIcon"]')).toBeInViewport();
    // Focus goes to the row, so reading and the keyboard go on from it.
    await expect(page.locator('[id="props-Button-startIcon"]')).toBeFocused();
  });

  test('choosing the place the address is at already scrolls to it again', async ({ page }) => {
    await openCatalogue(page, `${catalogueUrl}/components/button/props#props-Button-variant`);
    const row = page.locator('[id="props-Button-variant"]');
    await expect(row).toBeInViewport();
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(row).not.toBeInViewport();
    await search(page, 'Button.variant');
    await expect.poll(() => highlighted(page)).toBe('prop:Button.variant');
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(`${catalogueUrl}/components/button/props#props-Button-variant`);
    await expect(row).toBeInViewport();
    // As after a navigation, focus goes to the place, not back to the search button.
    await expect(row).toBeFocused();

    // A page chosen again while scrolled down shows its top, with focus on its content.
    await openCatalogue(page, `${catalogueUrl}/components/badge/overview`);
    await expect(page.getByRole('group', { name: 'Badge example', exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await search(page, 'Badge');
    await expect.poll(() => highlighted(page)).toBe('page:badge');
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('#docs-main')).toBeFocused();
  });

  test('a link to a heading opens the view that shows it', async ({ page }) => {
    // The Keyboard heading is in Button's Accessibility view, not its first.
    const route = routeOfDocument('button', { section: 'keyboard' });
    expect(route).toBe('components/button/accessibility?section=keyboard');
    // An old link to the page, without a view, opens the same view.
    expect(normalizeRoute('components/button?section=keyboard')).toBe(route);
    expect(normalizeRoute('components/button/overview?section=keyboard')).toBe(route);
    await openCatalogue(page, `${catalogueUrl}/components/button/accessibility#keyboard`);
    const heading = page.getByRole('heading', { name: 'Keyboard', exact: true });
    await expect(heading).toBeInViewport();
    await expect(heading).toBeFocused();
  });

  test('finds a token and opens the token reference at its row', async ({ page }) => {
    await openCatalogue(page, `${catalogueUrl}/`);
    await search(page, '--env-color-fg-muted');
    await expect.poll(() => highlighted(page)).toBe('token:color.fg.muted');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${catalogueUrl}/foundations/tokens#token-env-color-fg-muted`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design tokens');
    // The reference loads on its own, and the route scrolls to the row once it is there.
    await expect(page.locator('#token-env-color-fg-muted')).toBeInViewport();
    await expect(page.locator('#token-env-color-fg-muted')).toContainText('#5d6166');
  });

  test('finds every export, also one on a page without a Props view, at the section that shows it', async ({
    page,
  }) => {
    await openCatalogue(page, `${catalogueUrl}/`);
    await search(page, 'ThemePreferenceProvider');
    await expect.poll(() => highlighted(page)).toBe('export:ThemePreferenceProvider');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${catalogueUrl}/overview/get-started#theme-preference`);
    await expect(
      page.getByRole('heading', { name: 'Theme preference', exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: 'Theme preference', exact: true }),
    ).toBeFocused();
    await expect(option(page, 'export:ThemePreferenceProvider')).toHaveCount(0);
    await search(page, 'useTheme');
    await expect.poll(() => highlighted(page)).toBe('export:useTheme');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${catalogueUrl}/foundations/colors/usage#react-usage`);
    await expect(page.getByRole('heading', { name: 'React usage', exact: true })).toBeInViewport();
  });

  test('arrow keys, Home and End move through the grouped results, and Enter opens one', async ({
    page,
  }) => {
    await openCatalogue(page, `${catalogueUrl}/`);
    await search(page, 'button');
    await expect(dialog(page).getByRole('group', { name: 'Components' })).toBeVisible();
    const ids = await dialog(page)
      .getByRole('option')
      .evaluateAll((options) => options.map((element) => (element as HTMLElement).dataset.itemId));
    expect(ids.length).toBeGreaterThan(3);
    expect(ids[0]).toBe('page:button');
    await expect.poll(() => highlighted(page)).toBe(ids[0]);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe(ids[1]);
    await expect(option(page, ids[1]!)).toHaveAttribute('data-highlighted');
    await expect(option(page, ids[0]!)).not.toHaveAttribute('data-highlighted');
    await page.keyboard.press('End');
    await expect.poll(() => highlighted(page)).toBe(ids.at(-1));
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe(ids[0]);
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => highlighted(page)).toBe(ids.at(-1));
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => highlighted(page)).toBe(ids[1]);
    // Typing goes on in the field while the highlight moves.
    await expect(field(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    const [path] = routeOfResult(ids[1]!).split('?');
    await expect(page).toHaveURL(new RegExp(`/${path}(?:#.*)?$`));
    // A query without results says so.
    await search(page, 'zzzzqq');
    await expect(dialog(page).getByRole('status')).toHaveText('No results for “zzzzqq”');
  });

  test('every search result leads to a page of the catalogue, and to an element there', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Checks the index, the same in every browser.');
    test.setTimeout(240_000);
    const results = searchRecords();
    expect(results.length).toBeGreaterThan(1000);
    const sections = new Map<string, string[]>();
    for (const result of results) {
      const route = routeOfDocument(result.page, { view: result.view, section: result.section });
      expect(route, result.id).toBeDefined();
      // Each is the route's own address, not one that a redirect corrects.
      expect(normalizeRoute(route!), result.id).toBe(route);
      const [path, query] = route!.split('?');
      expect(
        findReferencePage(path) ?? findStandalonePage(path) ?? path.startsWith('overview/'),
        result.id,
      ).toBeTruthy();
      const section = new URLSearchParams(query).get('section');
      if (section && result.section) sections.set(path, [...(sections.get(path) ?? []), section]);
    }
    await openCatalogue(page, `${catalogueUrl}/`);
    for (const [path, ids] of sections) {
      await page.evaluate((route) => (location.hash = `/${route}`), path);
      await expect(page).toHaveURL(`${catalogueUrl}/${path}`);
      await expect(page.locator(`[id="${ids[0]}"]`)).toBeAttached();
      const missing = await page.evaluate(
        (ids) => ids.filter((id) => !document.getElementById(id)),
        ids,
      );
      expect(missing, path).toEqual([]);
    }
  });
});

test.describe('hosted build', () => {
  test('a deep link loads through the Worker, and loads again on refresh', async ({ page }) => {
    requireSite();
    await serveSite(page);
    await page.goto(`${siteUrl}/components/button/props#props-Button-variant`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    await expect(page.getByRole('tab', { name: 'Props', selected: true })).toBeVisible();
    await expect(page.locator('[id="props-Button-variant"]')).toBeInViewport();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    await expect(page).toHaveURL(`${siteUrl}/components/button/props#props-Button-variant`);
    await expect(page.locator('[id="props-Button-variant"]')).toBeInViewport();
    // A route with a trailing slash is the same page.
    await page.goto(`${siteUrl}/foundations/tokens/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design tokens');
    await expect(page).toHaveURL(`${siteUrl}/foundations/tokens`);

    const answers = await page.evaluate(async () => {
      const answer = async (path: string) => {
        const response = await fetch(path);
        return {
          status: response.status,
          type: response.headers.get('Content-Type'),
          cache: response.headers.get('Cache-Control'),
        };
      };
      const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]')!;
      return {
        route: await answer('/components/dialog/accessibility'),
        missing: await answer('/assets/gone-0000.js'),
        asset: await answer(new URL(script.src).pathname),
      };
    });
    // A page without a file answers with index.html; /assets/ never does.
    expect(answers.route).toMatchObject({ status: 200, type: 'text/html' });
    // WebKit drops the charset of a response the test fulfils.
    expect(answers.missing).toMatchObject({ status: 404, cache: 'no-store' });
    expect(answers.missing.type).toMatch(/^text\/plain\b/);
    expect(answers.asset).toMatchObject({
      status: 200,
      cache: 'private, max-age=31536000, immutable',
    });
    // The stored theme applies before the catalogue loads, from a script right after the
    // character set, which stays within the first 1024 bytes the browser looks in.
    for (const file of [resolve(site, 'index.html'), resolve('dist/envUI.html')]) {
      const html = readFileSync(file, 'utf8');
      const charset = html.indexOf('<meta charset="UTF-8" />');
      const script = html.indexOf('envui-catalogue-theme');
      expect(charset, file).toBeGreaterThan(-1);
      expect(charset + 24, file).toBeLessThan(1024);
      expect(script, file).toBeGreaterThan(charset);
      expect(script, file).toBeLessThan(
        html.search(/<style|<link rel="stylesheet"|<script type="module"/),
      );
    }
  });

  test('the stored theme, contrast and scale apply before the catalogue loads', async ({
    page,
  }) => {
    requireSite();
    await page.addInitScript(() => {
      localStorage.setItem('envui-catalogue-theme', 'dark');
      localStorage.setItem('envui-catalogue-contrast', 'high');
      localStorage.setItem('envui-catalogue-scale', 'compact');
    });
    // The catalogue's script never arrives, so only the head script runs.
    const entry = /^\/assets\/index-[\w-]+\.js$/;
    await serveSite(page, { failing: (pathname) => entry.test(pathname), failure: 'aborted' });
    await page.goto(`${siteUrl}/components/button/overview`);
    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-env-theme', 'dark');
    await expect(root).toHaveAttribute('data-env-contrast', 'high');
    await expect(root).toHaveAttribute('data-env-contrast-source', 'envui:high');
    await expect(root).toHaveAttribute('data-env-scale', 'compact');
    await expect(root).toHaveAttribute('data-env-scale-source', 'envui:compact');
    await expect(page.locator('.docs-app')).toHaveCount(0);
    // Once the catalogue loads, its provider keeps them as its own.
    await page.unroute(`${siteUrl}/**`);
    await serveSite(page);
    await page.reload();
    await expect(page.locator('.docs-app')).toHaveAttribute('data-env-scale', 'compact');
    await expect(root).toHaveAttribute('data-env-scale', 'compact');
    await expect(root).toHaveAttribute('data-env-contrast-source', 'envui:high');
  });

  test('links open pages without loading the catalogue again, and Back returns', async ({
    page,
  }) => {
    requireSite();
    await serveSite(page);
    await openCatalogue(page, `${siteUrl}/`);
    await page.evaluate(() => ((window as unknown as { loaded: boolean }).loaded = true));
    const navigation = page.getByRole('navigation', { name: 'Documentation' });
    await navigation.getByRole('link', { name: 'Dialog', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog/overview`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dialog');
    await expect(page.locator('#docs-main')).toBeFocused();
    await expect(navigation.getByRole('link', { name: 'Dialog', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.getByRole('tab', { name: 'Accessibility' }).click();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog/accessibility`);
    await navigation.getByRole('link', { name: 'Changelog', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/changelog`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Changelog');
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog/accessibility`);
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(`${siteUrl}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
    expect(await page.evaluate(() => (window as unknown as { loaded?: boolean }).loaded)).toBe(
      true,
    );
  });

  test('old hash addresses open their page at its path address', async ({ page }) => {
    requireSite();
    await serveSite(page);
    await page.goto(`${siteUrl}/#/components/tables/usage?section=keyboard`);
    // The Keyboard heading is in the Accessibility view, which opens.
    await expect(page).toHaveURL(`${siteUrl}/components/table/accessibility#keyboard`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Table');
    await page.goto(`${siteUrl}/#/overview/get-started?document=migration&section=documentation`);
    await expect(page).toHaveURL(`${siteUrl}/get-started/migration`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Migrate an interface to envUI',
    );
    // A hash route opened in the page, as by an old link, also moves to its path.
    await page.evaluate(() => (location.hash = '/components/buttons/preview'));
    await expect(page).toHaveURL(`${siteUrl}/components/button/overview`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    // The section addresses open their first page.
    await page.goto(`${siteUrl}/foundations`);
    await expect(page).toHaveURL(`${siteUrl}/foundations/colors/preview`);
  });

  test('search loads its index from its own file, when it first opens', async ({ page }) => {
    requireSite();
    const files = moduleFiles('src/search/SearchIndex.ts');
    const requested: string[] = [];
    let failing = false;
    page.on('request', (request) => requested.push(new URL(request.url()).pathname));
    await serveSite(page, {
      failing: (pathname) => failing && files.includes(pathname),
      failure: 'missing',
    });
    await openCatalogue(page, `${siteUrl}/`);
    expect(requested.filter((path) => files.includes(path))).toEqual([]);
    await search(page, 'hamburger');
    await expect.poll(() => highlighted(page)).toBe('page:sidebar');
    expect(requested).toContain(files[0]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${siteUrl}/components/sidebar/overview`);

    // An index that fails to load says so, and offers to load the page again.
    failing = true;
    await openCatalogue(page, `${siteUrl}/components/badge/overview`);
    await page.keyboard.press((await shortcutKeys(page)).own);
    await expect(dialog(page).getByText('Search could not load.')).toBeVisible();
    await expect(dialog(page).getByRole('button', { name: 'Reload the page' })).toBeVisible();
  });
});

test('search works in the offline catalogue, whose routes stay in the hash', async ({ page }) => {
  await openCatalogue(page, `${offline}#/overview`);
  await search(page, 'fg muted');
  await expect.poll(() => highlighted(page)).toBe('token:color.fg.muted');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${offline}#/foundations/tokens?section=token-env-color-fg-muted`);
  await expect(page.locator('#token-env-color-fg-muted')).toBeInViewport();
  await page
    .getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Loading', exact: true })
    .click();
  await expect(page).toHaveURL(`${offline}#/patterns/loading`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Loading');
});

for (const where of ['offline', 'hosted'] as const) {
  test(`a link to a heading of the same page scrolls to it, also again, ${where}`, async ({
    page,
  }) => {
    if (where === 'hosted') {
      requireSite();
      await serveSite(page);
    }
    const base = where === 'offline' ? `${offline}#/` : `${siteUrl}/`;
    await openCatalogue(page, `${base}get-started/migration`);
    const heading = page.getByRole('heading', { name: 'Scale and density', exact: true });
    await expect(heading).toHaveAttribute('id', 'scale-and-density');
    // The guide links the heading of its own and, elsewhere, the page of the same name.
    const link = page
      .locator('.docs-article')
      .getByRole('link', { name: 'scale and density' })
      .and(page.locator('a[href*="scale-and-density"]'));
    await link.click();
    await expect(page).toHaveURL(
      where === 'offline'
        ? `${offline}#/get-started/migration?section=scale-and-density`
        : `${siteUrl}/get-started/migration#scale-and-density`,
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Migrate an interface to envUI',
    );
    await expect(heading).toBeInViewport();
    // Focus goes to the heading, where reading goes on.
    await expect(heading).toBeFocused();
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect(heading).not.toBeInViewport();
    await link.click();
    await expect(heading).toBeInViewport();
    await expect(heading).toBeFocused();
  });
}

test('the Display menu stores the theme, contrast and scale, for a reload and other tabs', async ({
  page,
  context,
}) => {
  await openCatalogue(page, `${catalogueUrl}/components/button/overview`);
  const app = page.locator('.docs-app');
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect(app).not.toHaveAttribute('data-env-contrast', /./);
  await expect(app).toHaveAttribute('data-env-scale', 'comfortable');
  const choose = async (group: string, name: string) => {
    await page.getByRole('button', { name: 'Display', exact: true }).first().click();
    const menu = page.getByRole('menu', { name: 'Display' });
    await menu
      .getByRole('group', { name: group })
      .getByRole('menuitemradio', { name, exact: true })
      .click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  };
  await choose('Theme', 'Dark');
  await choose('Contrast', 'High');
  await choose('Scale', 'Compact');
  const chosen = async (target: Page) => {
    const settings = target.locator('.docs-app');
    await expect(settings).toHaveAttribute('data-env-theme', 'dark');
    await expect(settings).toHaveAttribute('data-env-contrast', 'high');
    await expect(settings).toHaveAttribute('data-env-scale', 'compact');
    // The document root follows, for the page's background and native controls.
    await expect(target.locator('html')).toHaveAttribute('data-env-theme', 'dark');
  };
  await chosen(page);
  await page.getByRole('button', { name: 'Display', exact: true }).first().click();
  await expect(page.getByRole('menuitemradio', { name: 'Dark', exact: true })).toBeChecked();
  await expect(page.getByRole('menuitemradio', { name: 'High', exact: true })).toBeChecked();
  await expect(page.getByRole('menuitemradio', { name: 'Compact', exact: true })).toBeChecked();
  await page.keyboard.press('Escape');
  await page.reload();
  await chosen(page);
  const other = await context.newPage();
  await openCatalogue(other, `${catalogueUrl}/foundations/colors/preview`);
  await chosen(other);
  // The theme button switches and stores the theme too.
  await other.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(other.locator('.docs-app')).toHaveAttribute('data-env-theme', 'light');
  // And another tab follows at once.
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  // System follows the operating system's theme.
  await choose('Theme', 'System');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(app).toHaveAttribute('data-env-theme', 'light');
});
