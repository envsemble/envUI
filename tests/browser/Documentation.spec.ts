import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;
const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;
const components = [
  'layout',
  'buttons',
  'fields',
  'checkbox',
  'switch',
  'radio',
  'select',
  'navigation',
  'direction-links',
  'rows',
  'cards',
  'chips',
  'disclosures',
  'empty-state',
  'loading',
  'toasts',
  'dialogs',
];
const foundations = ['colors', 'typography', 'spacing', 'composition', 'icons', 'accessibility'];

test('direction link groups center pairs and single destinations at every page width', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/direction-links/preview`);
  const groups = page.locator('.env-direction-links');
  await expect(groups).toHaveCount(5);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const group of await groups.all()) {
      const geometry = await group.evaluate((nav) => {
        const rect = nav.getBoundingClientRect();
        const css = getComputedStyle(nav);
        const links = Array.from(nav.querySelectorAll('a')).map((link) => {
          const box = link.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        });
        return {
          left: rect.left + parseFloat(css.paddingLeft),
          right: rect.right - parseFloat(css.paddingRight),
          gap: parseFloat(css.columnGap),
          links,
        };
      });
      const first = geometry.links[0];
      const last = geometry.links.at(-1)!;
      for (const link of geometry.links) {
        expect(link.left).toBeGreaterThanOrEqual(geometry.left - 1);
        expect(link.right).toBeLessThanOrEqual(geometry.right + 1);
      }
      const sameRow = Math.abs(first.top - last.top) < 1;
      const rows = sameRow ? [{ left: first.left, right: last.right }] : geometry.links;
      for (const row of rows) {
        expect(
          Math.abs((row.left + row.right) / 2 - (geometry.left + geometry.right) / 2),
        ).toBeLessThan(1);
      }
      if (geometry.links.length === 2 && sameRow) {
        expect(Math.abs(last.left - first.right - geometry.gap)).toBeLessThan(1);
      } else if (geometry.links.length === 2) {
        expect(Math.abs(last.top - first.bottom - geometry.gap)).toBeLessThan(1);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const longDestinations = page.getByRole('navigation', { name: 'Long destinations example' });
  const fragmentedWords = await longDestinations.evaluate((nav) => {
    const fragments: string[] = [];
    for (const title of nav.querySelectorAll('.env-direction-link-title')) {
      const text = title.firstChild!;
      for (const word of text.textContent!.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(text, word.index!);
        range.setEnd(text, word.index! + word[0].length);
        if (range.getClientRects().length > 1) fragments.push(word[0]);
      }
    }
    return fragments;
  });
  expect(fragmentedWords).toEqual([]);
  const footer = page.locator('.docs-page-navigation');
  const nextDestination = await footer.getByRole('link').last().getAttribute('href');
  await footer.getByRole('link').last().click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(nextDestination);
  await page.evaluate(() => {
    location.hash = '/components/radio/usage';
  });
  await expect(footer.getByRole('link').last()).toHaveAttribute(
    'href',
    '#/components/select/usage',
  );
  await footer.getByRole('link').last().click();
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Usage',
  );
  await page.evaluate(() => {
    location.hash = '/overview';
  });
  await expect(footer.getByRole('link')).toHaveCount(1);
  await expect(footer.getByRole('link')).toHaveAttribute('rel', 'next');
  const centerError = () =>
    footer.evaluate((nav) => {
      const outer = nav.getBoundingClientRect();
      const link = nav.querySelector('a')!.getBoundingClientRect();
      return Math.abs((outer.left + outer.right) / 2 - (link.left + link.right) / 2);
    });
  expect(await centerError()).toBeLessThan(1);
  const finalDestination = await page
    .locator('.docs-sidebar')
    .getByRole('link')
    .last()
    .getAttribute('href');
  await page.evaluate((hash) => {
    location.hash = hash!;
  }, finalDestination);
  await expect(footer.getByRole('link')).toHaveCount(1);
  await expect(footer.getByRole('link')).toHaveAttribute('rel', 'prev');
  expect(await centerError()).toBeLessThan(1);
});

test('offline reference loads every view without network or script errors', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`${offline}#/overview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'React components for envsemble',
  );
  await expect(page.locator('.docs-sidebar-footer')).toContainText(`envUI · ${version}`);
  for (const id of components) {
    for (const view of ['preview', 'usage']) {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, `/components/${id}/${view}`);
      await expect(
        page.locator('.docs-page-header').getByRole('tab', { selected: true }),
      ).toHaveText(view[0].toUpperCase() + view.slice(1));
      if (view === 'preview') await expect(page.locator('.docs-preview')).toHaveCount(1);
    }
  }
  for (const id of foundations) {
    await page.evaluate((hash) => {
      location.hash = hash;
    }, `/foundations/${id}`);
    await expect(page.locator('.docs-preview')).toHaveCount(1);
  }
  await page.evaluate(() => {
    location.hash = '/getting-started/usage';
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Inter"'))).toBe(true);
});

test('single previews retain state when the theme changes', async ({ page }) => {
  await page.goto(`${offline}#/components/input/preview`);
  const preview = page.locator('.docs-preview');
  const projectName = preview.getByRole('textbox', { name: 'Project name' }).first();
  await projectName.fill('Winter release');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(preview).toHaveAttribute('data-env-theme', 'dark');
  await expect(projectName).toHaveValue('Winter release');
  for (const width of [1920, 1440, 960, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(preview).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(projectName).toHaveValue('Winter release');
  await page.evaluate(() => {
    location.hash = '/components/checkbox/preview';
  });
  await preview.getByRole('checkbox', { name: 'Include archived items' }).first().check();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(
    preview.getByRole('checkbox', { name: 'Include archived items' }).first(),
  ).toBeChecked();
  await page.evaluate(() => {
    location.hash = '/components/notes/preview';
  });
  await preview.locator('summary').click();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(preview.locator('details')).toHaveAttribute('open', '');
});

test('offline hashes support direct links and back/forward navigation', async ({ page }) => {
  await page.goto(`${offline}#/components/select/usage`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Selects');
  await page.getByRole('tab', { name: 'Preview', exact: true }).click();
  await page.getByRole('tab', { name: 'Usage', exact: true }).click();
  await page.goBack();
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Preview',
  );
  await page.goForward();
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Usage',
  );
});

test('offline theme toggle switches the whole page and keeps the canvas full height', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${offline}#/components/checkbox/preview`);
  const app = page.locator('.docs-app');
  const panes = page.locator('.docs-preview');
  await panes.first().getByRole('checkbox', { name: 'Include archived items' }).first().check();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes.first()).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(1);
  for (const pane of await panes.all())
    await expect(
      pane.getByRole('checkbox', { name: 'Include archived items' }).first(),
    ).toBeChecked();
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
  await expect(panes.first().locator('.docs-swatch code').first()).toContainText('hsl(');
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
  await page.screenshot({
    path: testInfo.outputPath('offline-theme-light.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({
    path: testInfo.outputPath('offline-theme-dark.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.evaluate(() => {
    location.hash = '/getting-started';
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(1);
});
