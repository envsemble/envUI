/**
 * The catalogue's search, navigation and display settings: search in envUI's CommandPalette, opened
 * with ⌘K or Ctrl+K, hosted and offline; path routes in the hosted build, served through the
 * hosted Worker script, with deep links, refreshes and the old hash addresses; and hash routes in
 * the offline catalogue. tests/SearchIndex.test.mjs checks that every result leads to a section.
 */
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, site, siteUrl } from './HostedSite';
import {
  normalizeRoute,
  routeOfDocument,
} from '../../apps/catalogue/src/navigation/DocumentationRoutes';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;

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
  // As SearchTrigger decides: by the platform, which WebKit on Windows reports as Windows although
  // its user agent names a Mac.
  const apple = await page.evaluate(() => {
    const { userAgentData } = navigator as Navigator & { userAgentData?: { platform?: string } };
    return /mac|iphone|ipad|ipod/i.test(userAgentData?.platform || navigator.platform || '');
  });
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
  test(
    'Ctrl+K, or ⌘K on Apple platforms, opens and closes search, and so does its button',
    { tag: '@engines' },
    async ({ page }) => {
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
    },
  );

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

  test('a link to a heading opens the view that shows it', async ({ page }) => {
    // A page on the figure template shows every heading in its Overview, also for a link to an
    // old view or to the page without a view.
    const route = routeOfDocument('dialog', { section: 'keyboard' });
    expect(route).toBe('components/dialog/overview?section=keyboard');
    expect(normalizeRoute('components/dialog?section=keyboard')).toBe(route);
    expect(normalizeRoute('components/dialog/accessibility?section=keyboard')).toBe(route);
    expect(normalizeRoute('components/button/accessibility?section=keyboard')).toBe(
      'components/button/overview?section=keyboard',
    );
    await openCatalogue(page, `${catalogueUrl}/components/dialog/accessibility#keyboard`);
    const heading = page.getByRole('heading', { name: 'Keyboard', exact: true });
    await expect(heading).toBeInViewport();
    await expect(heading).toBeFocused();
  });
});

test.describe('hosted build', () => {
  test(
    'a deep link loads through the Worker, and loads again on refresh',
    { tag: '@engines' },
    async ({ page }) => {
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
    },
  );

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
    await page.getByRole('tab', { name: 'Props' }).click();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog/props`);
    await navigation.getByRole('link', { name: 'Changelog', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/changelog`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Changelog');
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog/props`);
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
    // The Keyboard heading is in the Overview, which opens on the figure template.
    await expect(page).toHaveURL(`${siteUrl}/components/table/overview#keyboard`);
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
    await expect.poll(() => highlighted(page)).toBe('page:drawer');
    expect(requested).toContain(files[0]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${siteUrl}/components/drawer/overview`);

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
