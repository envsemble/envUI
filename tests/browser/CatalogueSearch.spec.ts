/**
 * The site's search and navigation: search in envUI's CommandPalette, opened with ⌘K or Ctrl+K,
 * which finds pages of the catalogue and the Docs, each page once; path routes in the hosted
 * build, served through the hosted Worker script, with deep links into both areas, refreshes and
 * the redirects from old hash addresses. tests/SearchIndex.test.mjs checks that every result leads to a section.
 */
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { siteDevUrl } from './helpers/Servers';
import { moduleFiles, requireSite, serveSite, site, siteUrl } from './helpers/HostedSite';
import { normalizeRoute, routeOfDocument } from '../../apps/site/src/navigation/SiteRoutes';

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Search envUI' });
const field = (page: Page) => dialog(page).getByRole('combobox', { name: 'Search envUI' });
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
  // As the catalogue decides: by the platform, which WebKit on Windows reports as Windows although
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
  await expect(dialog(page).locator('.site-loading')).toHaveCount(0);
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
      await openCatalogue(page, `${siteDevUrl}/`);
      const keys = await shortcutKeys(page);
      await page.keyboard.press(keys.own);
      await expect(dialog(page)).toBeVisible();
      await expect(field(page)).toBeFocused();
      // Before people type, search suggests where to start.
      await expect(dialog(page).getByRole('group', { name: 'Suggested' })).toBeVisible();
      await page.keyboard.press(keys.own);
      await expect(dialog(page)).toBeHidden();
      // The other platform's modifier leaves the keys to the page, such as Ctrl+K in a Mac text field.
      await page.keyboard.press(keys.other);
      await expect(dialog(page)).toBeHidden();
      await page.keyboard.press(keys.own);
      await expect(dialog(page)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();

      // The Overview has no drawer, and search at the page's top start.
      const button = page
        .locator('.site-page-search')
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

  test('suggests the same page in the other part and where to start, until people type', async ({
    page,
  }) => {
    await openCatalogue(page, `${siteDevUrl}/components/badge`);
    await page.keyboard.press((await shortcutKeys(page)).own);
    const suggested = dialog(page).getByRole('group', { name: 'Suggested' });
    // The page's counterpart in the Docs comes first, highlighted, then the starting points.
    await expect(suggested.getByRole('option')).toHaveText([
      /^Badge.*Docs/,
      /^Install and set up/,
      /^All components/,
      /^All patterns/,
      /^Design tokens/,
    ]);
    await expect.poll(() => highlighted(page)).toBe('docs/components/badge');
    // A query replaces them with its results, and a query that finds nothing says so.
    await field(page).fill('qwzxv');
    const status = dialog(page).locator('.env-command-palette-status');
    await expect(status).toContainText('No results');
    await expect(status).toContainText('Nothing matches “qwzxv”');
    await expect(suggested).toHaveCount(0);
    await field(page).fill('');
    await expect.poll(() => highlighted(page)).toBe('docs/components/badge');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${siteDevUrl}/docs/components/badge`);
    // From the Docs, the counterpart is the catalogue's page.
    await page.keyboard.press((await shortcutKeys(page)).own);
    await expect(option(page, 'components/badge')).toContainText('Catalogue');
  });

  test("finds a prop and opens its component's page in the Docs at its row", async ({ page }) => {
    await openCatalogue(page, `${siteDevUrl}/`);
    await search(page, 'start icon');
    const result = option(page, 'prop:Button.startIcon');
    await expect(result).toBeVisible();
    // A result says what it is; the part it is in only where another result shown shares its name.
    await expect(result).toContainText('Button prop');
    await expect(result).not.toContainText('Docs ·');
    await expect(dialog(page).getByRole('group', { name: 'Props' })).toBeVisible();
    await result.click();
    await expect(page).toHaveURL(`${siteDevUrl}/docs/components/button#props-Button-startIcon`);
    await expect(page.getByRole('navigation', { name: 'Docs' })).toBeVisible();
    await expect(page.locator('[id="props-Button-startIcon"]')).toBeInViewport();
    // Focus goes to the row, so reading and the keyboard go on from it.
    await expect(page.locator('[id="props-Button-startIcon"]')).toBeFocused();
  });

  test('lists what a query names before what only mentions it in its text', async ({ page }) => {
    await openCatalogue(page, `${siteDevUrl}/`);
    await search(page, 'date');
    const groups = dialog(page).getByRole('group');
    await expect(groups.first()).toContainText('DatePicker');
    const mentions = groups.last();
    await expect(mentions).toHaveAccessibleName('Also mentioned in');
    // A pattern that only composes a component the query names is a mention, not a pattern found.
    await expect(dialog(page).getByRole('group', { name: 'Patterns', exact: true })).toHaveCount(0);
    // What only mentions it folds into one row, which shows it in place.
    const mentioned = mentions.locator('[data-item-id="more:Also mentioned in"]');
    await expect(mentions.getByRole('option')).toHaveCount(1);
    await mentioned.click();
    await expect(mentioned).toHaveCount(0);
    await expect(mentions.locator('[data-item-id="page:table"]')).toBeVisible();
    // The props of the component the query names come first, before those it names by their own
    // name, such as CalendarHeatmap's startDate; a few show, and the rest wait in a row that shows
    // them in place and keeps search open.
    const props = dialog(page).getByRole('group', { name: 'Props' });
    const more = props.locator('[data-item-id="more:Props"]');
    await expect(props.getByRole('option')).toHaveCount(4);
    await expect(props.getByRole('option').first()).toContainText('DatePicker prop');
    await expect(props).not.toContainText('startDate');
    await more.click();
    await expect(more).toHaveCount(0);
    await expect(props).toContainText('startDate');
    await expect(field(page)).toHaveValue('date');
    // A query that names no prop folds the props into the row; shown, a component's own props
    // come before those it passes to its root, such as className.
    await field(page).fill('Textarea');
    await expect(props.getByRole('option')).toHaveCount(1);
    await props.locator('[data-item-id="more:Props"]').click();
    await expect(props.getByRole('option').first()).toContainText('Textarea prop');
    const shown = await props
      .getByRole('option')
      .evaluateAll((options) => options.map((option) => option.getAttribute('data-item-id')));
    const own = shown.filter((id) => id?.startsWith('prop:Textarea.'));
    const passed = own.findIndex((id) => /\.(ref|className|style)$/.test(id!));
    expect(own.slice(passed).every((id) => /\.(ref|className|style)$/.test(id!))).toBe(true);
  });

  test('finds a page once, and opens it in the part the reader is in', async ({ page }) => {
    await openCatalogue(page, `${siteDevUrl}/docs`);
    await search(page, 'colors and themes');
    await expect(option(page, 'page:colors')).toContainText('Foundations');
    await expect(option(page, 'page:colors')).not.toContainText('Catalogue ·');
    await expect(dialog(page).getByRole('option', { name: /^Colors & themes/ })).toHaveCount(1);
    await field(page).fill('button');
    await expect(option(page, 'page:button')).toContainText('Actions');
    await page.keyboard.press('Enter');
    // From the Docs, a page found opens in the Docs; from the catalogue, in the catalogue.
    await expect(page).toHaveURL(`${siteDevUrl}/docs/components/button`);
    await expect(page.getByRole('navigation', { name: 'Docs' })).toBeVisible();
    await openCatalogue(page, `${siteDevUrl}/components`);
    await search(page, 'button');
    await expect(option(page, 'page:button')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${siteDevUrl}/components/button`);
  });

  test('a link to a heading opens the page that shows it', async ({ page }) => {
    // A component's page shows every heading, also for a link to an old view.
    const route = routeOfDocument('dialog', { section: 'pending-work' });
    expect(route).toBe('components/dialog?section=pending-work');
    expect(normalizeRoute('components/dialog?section=pending-work')).toBe(route);
    expect(normalizeRoute('components/dialog/accessibility?section=pending-work')).toBe(route);
    expect(normalizeRoute('components/button/accessibility?section=keyboard')).toBe(
      'components/button?section=keyboard',
    );
    await openCatalogue(page, `${siteDevUrl}/components/dialog/accessibility#pending-work`);
    const heading = page.getByRole('heading', { name: 'Pending work', exact: true });
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
      await page.goto(`${siteUrl}/docs/components/button#props-Button-variant`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
      await expect(page.locator('[id="props-Button-variant"]')).toBeInViewport();
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
      await expect(page).toHaveURL(`${siteUrl}/docs/components/button#props-Button-variant`);
      await expect(page.locator('[id="props-Button-variant"]')).toBeInViewport();
      // A route with a trailing slash is the same page, in the catalogue and the Docs.
      await page.goto(`${siteUrl}/docs/tokens/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design tokens');
      await expect(page).toHaveURL(`${siteUrl}/docs/tokens`);
      await page.goto(`${siteUrl}/components/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
      await expect(page).toHaveURL(`${siteUrl}/components`);

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
          route: await answer('/components/dialog'),
          docs: await answer('/docs/components/dialog'),
          missing: await answer('/assets/gone-0000.js'),
          asset: await answer(new URL(script.src).pathname),
        };
      });
      // A page without a file answers with index.html, in the catalogue and the Docs; /assets/
      // never does.
      expect(answers.route).toMatchObject({ status: 200, type: 'text/html' });
      expect(answers.docs).toMatchObject({ status: 200, type: 'text/html' });
      // WebKit drops the charset of a response the test fulfils.
      expect(answers.missing).toMatchObject({ status: 404, cache: 'no-store' });
      expect(answers.missing.type).toMatch(/^text\/plain\b/);
      expect(answers.asset).toMatchObject({
        status: 200,
        cache: 'private, max-age=31536000, immutable',
      });
      // The stored theme applies before the catalogue loads, from a script right after the
      // character set, which stays within the first 1024 bytes the browser looks in.
      for (const file of [resolve(site, 'index.html')]) {
        const html = readFileSync(file, 'utf8');
        const charset = html.indexOf('<meta charset="UTF-8" />');
        const script = html.indexOf('envui-site-theme');
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
    const rail = page.getByRole('navigation', { name: 'Catalogue' });
    await rail.getByRole('link', { name: 'Components', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/components`);
    const navigation = page.getByRole('navigation', { name: 'Components' });
    await navigation.getByRole('button', { name: 'Overlays', exact: true }).click();
    await navigation.getByRole('link', { name: 'Dialog', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dialog');
    await expect(page.locator('#site-main')).toBeFocused();
    await expect(navigation.getByRole('link', { name: 'Dialog', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page
      .locator('.site-page-header')
      .getByRole('link', { name: 'Code', exact: true })
      .click();
    await expect(page).toHaveURL(`${siteUrl}/docs/components/dialog`);
    // The switch leads back to the same subject in the catalogue.
    await page
      .locator('.site-page-header')
      .getByRole('link', { name: 'Design', exact: true })
      .click();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog`);
    await rail.getByRole('link', { name: 'Overview', exact: true }).click();
    await expect(page).toHaveURL(`${siteUrl}/`);
    await page.goBack();
    await expect(page).toHaveURL(`${siteUrl}/components/dialog`);
    await page.goBack();
    await expect(page).toHaveURL(`${siteUrl}/docs/components/dialog`);
    await page.goBack();
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
    // The Keyboard heading is on the component's page.
    await expect(page).toHaveURL(`${siteUrl}/components/table#keyboard`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Table');
    await page.goto(`${siteUrl}/#/overview/get-started?document=migration&section=documentation`);
    await expect(page).toHaveURL(`${siteUrl}/docs/migration`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Move an app to envUI');
    // An old hash address entered in an open page is redirected to its path too.
    await page.evaluate(() => (location.hash = '/components/buttons/preview'));
    await expect(page).toHaveURL(`${siteUrl}/components/button`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    // A page's old views open the page they became, its props in the Docs.
    await page.goto(`${siteUrl}/components/button/props`);
    await expect(page).toHaveURL(`${siteUrl}/docs/components/button`);
    await page.goto(`${siteUrl}/foundations/tokens`);
    await expect(page).toHaveURL(`${siteUrl}/docs/tokens`);
    // A section's address is its own page, as the rail opens it.
    await page.goto(`${siteUrl}/foundations`);
    await expect(page).toHaveURL(`${siteUrl}/foundations`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foundations');
  });

  test('search loads its index from its own file, once the page is idle', async ({ page }) => {
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
    // Ahead of search opening, so its results are there as people type.
    await expect.poll(() => requested).toContain(files[0]);
    await search(page, 'hamburger');
    await expect.poll(() => highlighted(page)).toBe('page:navigation-drawer');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${siteUrl}/components/navigation-drawer`);

    // An index that fails to load says so, and offers to load the page again.
    failing = true;
    await openCatalogue(page, `${siteUrl}/docs/components/badge`);
    await page.keyboard.press((await shortcutKeys(page)).own);
    // The suggestions need no index; a query says that search could not load.
    await expect(option(page, 'components/badge')).toBeVisible();
    await field(page).fill('badge');
    await expect(dialog(page).getByText('Search could not load')).toBeVisible();
    await expect(dialog(page).getByRole('button', { name: 'Reload the page' })).toBeVisible();
  });
});

test('a token found in search opens the token reference in the Docs', async ({ page }) => {
  await openCatalogue(page, `${siteDevUrl}/`);
  await search(page, 'fg muted');
  await expect.poll(() => highlighted(page)).toBe('token:color.fg.muted');
  await expect(option(page, 'token:color.fg.muted')).toContainText('color token');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${siteDevUrl}/docs/tokens#token-env-color-fg-muted`);
  await expect(page.locator('#token-env-color-fg-muted')).toBeInViewport();
  // The token reference has no page in the catalogue: the switch leads to its Overview.
  await page
    .locator('.site-page-actions')
    .getByRole('link', { name: 'Catalogue', exact: true })
    .click();
  await expect(page).toHaveURL(`${siteDevUrl}/`);
  await page
    .getByRole('navigation', { name: 'Catalogue' })
    .getByRole('link', { name: 'Patterns', exact: true })
    .click();
  const patterns = page.getByRole('navigation', { name: 'Patterns' });
  await patterns.getByRole('button', { name: 'Keep people informed', exact: true }).click();
  await patterns.getByRole('link', { name: 'Loading', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/patterns/loading`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Loading');
});
