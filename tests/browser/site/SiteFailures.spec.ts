import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl } from '../support/Servers';
import { moduleFiles, requireSite, serveSite, siteUrl } from '../support/HostedSite';
import { displayStorageKeys } from '../../../apps/site/src/display/DisplayStorage';
import { goTo } from '../support/SiteNavigation';

async function openFailingButtonPage(page: Page) {
  const loaded = new Set([
    ...moduleFiles('src/pages/catalogue/CataloguePages.tsx'),
    ...moduleFiles('src/generated/pages/button.json'),
  ]);
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
  await expect(
    page.getByRole('heading', { level: 1, name: /^A React design system/ }),
  ).toBeVisible();
  await expect(page.locator('.site-loading')).toHaveCount(0);
  state = 'failing';
  await goTo(page, '/components/button');
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  return { hero, set: (next: 'assets' | 'up') => (state = next) };
}

async function breakOnPress(page: Page, file: string, name: string) {
  await page.route(file, async (route) => {
    const original = await (await route.fetch()).text();
    const version = /\/node_modules\/\.vite\/deps\/[\w-]+\.js\?v=(\w+)/.exec(original)?.[1];
    expect(version, `${file} imports Vite's prebundled dependencies`).toBeTruthy();
    await route.fulfill({
      contentType: 'text/javascript',
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

test('a page whose content fails to load says so, and loads it again on request', async ({
  page,
}) => {
  const content = '**/src/generated/pages/button.json*';
  await page.route(content, (route) => route.abort());
  await page.goto(`${siteDevUrl}/components/button`);
  const main = page.getByRole('main');
  await expect(main.getByText('The page could not load')).toBeVisible();
  await expect(main.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  await page.unroute(content);
  await main.getByRole('button', { name: 'Try again', exact: true }).click();
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(main.getByText('The page could not load')).toHaveCount(0);
});

test('in the hosted build, an example whose file is missing offers a reload, which loads it', async ({
  page,
}) => {
  requireSite();
  const [file] = moduleFiles('src/examples/button/CreateProject.tsx');
  let failing = true;
  await serveSite(page, {
    failing: (pathname) => failing && pathname === file,
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

test("in the hosted build, a pre-rendered page whose view can't load says so in the page's place", async ({
  page,
}) => {
  requireSite();
  const [view] = moduleFiles('src/pages/catalogue/CataloguePages.tsx');
  await serveSite(page, { failing: (pathname) => pathname === view, failure: 'missing' });
  await page.goto(`${siteUrl}/components/button`);
  const main = page.getByRole('main');
  await expect(main.getByText('The page could not load')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(main.getByRole('heading', { name: 'Overview' })).toHaveCount(0);
  await expect(main.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  await expect(main.getByRole('link', { name: /Link/ }).last()).toBeVisible();
});

test("in the hosted build, a reload whose files can't be fetched keeps the page and says so", async ({
  page,
}) => {
  requireSite();
  const { hero, set } = await openFailingButtonPage(page);
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
  await page.goto(`${siteDevUrl}/components/button`);
  await page
    .locator('.site-live-example-entry')
    .first()
    .locator('.site-live-example-code summary')
    .click();
  const entry = page.getByRole('region', { name: 'Code, CreateProject.tsx', exact: true });
  await expect(entry.getByText('The code could not load')).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Button example', exact: true }).getByRole('button').first(),
  ).toBeVisible();
  expect(warnings).toEqual([]);
  await page.unroute(source);
  await entry.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(entry.getByText('The code could not load')).toHaveCount(0);
  await expect(entry.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
});

test('an example that fails to load says so in place, and a retry loads it and returns focus once', async ({
  page,
}) => {
  const example = '**/src/examples/button/CreateProject.tsx*';
  await page.route(example, (route) => route.abort());
  await page.goto(`${siteDevUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(hero.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  await page.unroute(example);
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(hero.getByText('The example could not load')).toHaveCount(0);
  expect(await hero.evaluate((group) => group.contains(document.activeElement))).toBe(true);
  const body = page.locator('#site-main');
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
  await expect(page.locator('html')).toHaveAttribute('data-env-theme', 'dark');
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
  await page.goto(`${siteDevUrl}/components/button`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await expect(hero.getByText('This example failed to render')).toBeVisible();
  await expect(hero.getByText('Broken example')).toBeVisible();
  await expect(page.getByText('The example could not load')).toHaveCount(0);
  await expect(hero.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  const links = page.getByRole('group', { name: 'Links example', exact: true });
  await expect(links.getByRole('link').first()).toBeVisible();
  await page
    .locator('.site-live-example-entry')
    .first()
    .locator('.site-live-example-code summary')
    .click();
  const entry = page.getByRole('region', { name: 'Code, CreateProject.tsx', exact: true });
  await expect(entry.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Link', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Link');
});

test('a page that fails to render says so, and the navigation leads to the others', async ({
  page,
}) => {
  await page.route('**/src/pages/catalogue/Overview.tsx', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: "export function Overview() { throw new Error('Broken page'); }",
    }),
  );
  await page.goto(`${siteDevUrl}/`);
  const main = page.getByRole('main');
  await expect(main.getByText('This page failed to render')).toBeVisible();
  await expect(main.getByText('Broken page')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('envUI');
  await expect(main.getByRole('link', { name: 'Return to overview' })).toHaveCount(0);
  await expect(main.getByRole('button', { name: 'Reload the page', exact: true })).toBeVisible();
  await expect(main).not.toBeFocused();
  const navigation = page.getByRole('navigation', { name: 'Gallery' });
  await navigation.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
  await expect(main.getByText('This page failed to render')).toHaveCount(0);
  await expect(main.getByRole('link', { name: /^Button/ }).first()).toBeVisible();
  await page.goBack();
  await expect(main.getByText('This page failed to render')).toBeVisible();
});

test('a page that fails after a press takes the focus it dropped, and leads to the overview', async ({
  page,
}) => {
  await breakOnPress(page, '**/src/pages/catalogue/Catalogue.tsx', 'Catalogue');
  await page.goto(`${siteDevUrl}/components`);
  const main = page.getByRole('main');
  const press = main.getByRole('button', { name: 'Break', exact: true });
  await expect(async () => {
    await press.focus();
    await expect(press).toBeFocused({ timeout: 500 });
  }).toPass();
  await page.keyboard.press('Enter');
  const alert = main.locator('.env-alert');
  await expect(alert).toContainText('This page failed to render');
  await expect(alert).toBeFocused();
  await main.getByRole('link', { name: 'Return to overview', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: /^A React design system/ }),
  ).toBeVisible();
  await expect(alert).toHaveCount(0);
});
