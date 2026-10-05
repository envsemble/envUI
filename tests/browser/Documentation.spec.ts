import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { references, foundations as foundationReferences } from '../../apps/docs/src/Reference';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;
const version = JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version;
const components = references.map(({ id }) => id);
const foundations = foundationReferences.map(({ id }) => id);

test('Markdown combines rendering and one editor demo, including old editor bookmarks', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/markdown-editor/preview`);
  await expect(
    page.getByRole('heading', { name: 'Markdown', exact: true, level: 1 }),
  ).toBeVisible();
  const preview = page.locator('.docs-preview');
  await expect(
    preview.getByRole('heading', { name: 'Rendered markdown', exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole('heading', { name: 'Markdown editor demo', exact: true }),
  ).toBeVisible();
  await expect(preview.getByText(/This demo is not saved/)).toBeVisible();
  await expect(preview.locator('.env-markdown-editor')).toHaveCount(1);
  const source = preview.getByRole('textbox', { name: 'Markdown input' });
  await source.fill('## Edited demo\n\nA **new** draft.');
  const editor = preview.locator('.env-card').last();
  await editor.getByRole('tab', { name: 'Output', exact: true }).click();
  await expect(editor.getByRole('heading', { name: 'Edited demo' })).toBeVisible();
  await editor.getByRole('tab', { name: 'Input', exact: true }).click();
  await expect(source).toHaveValue('## Edited demo\n\nA **new** draft.');
  await expect(preview.getByText('Demo markdown source', { exact: true })).toHaveCount(0);
  const renderer = preview.locator('.env-card').first();
  await renderer.getByRole('tab', { name: 'Input', exact: true }).click();
  await expect(renderer.locator('code')).toContainText('## Project checklist');
  await renderer.getByRole('tab', { name: 'Output', exact: true }).click();
  await expect(renderer.getByRole('heading', { name: 'Project checklist' })).toBeVisible();
  await page.goto(`${offline}#/components/markdown-editor/usage`);
  await expect(page.getByRole('heading', { name: 'Render content', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Edit and preview', exact: true })).toBeVisible();
  expect(references.filter(({ id }) => id === 'markdown')).toHaveLength(1);
  expect(references.some(({ id }) => id === 'markdown-editor')).toBe(false);
});

test('palette editing uses public controls and remains temporary and independent between themes', async ({
  page,
}) => {
  await page.goto(`${offline}#/foundations/colors/preview`);
  const app = page.locator('.docs-app');
  const canvasValue = () =>
    app.evaluate((element) => getComputedStyle(element).getPropertyValue('--color-canvas').trim());
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

test('button link specimens and optional interaction matrices consume public controls', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/buttons/preview`);
  const hash = await page.evaluate(() => location.hash);
  const preview = page.locator('.docs-preview');
  await preview.getByRole('link', { name: 'Read guide', exact: true }).press('Enter');
  await expect(preview.getByRole('status')).toHaveText('Selected destination: Guide');
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  await preview
    .getByRole('link', { name: 'project guide', exact: true })
    .click({ modifiers: ['Control'] });
  await expect(preview.getByRole('status')).toHaveText('Selected destination: Project guide');
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  const disclosure = preview.locator('details.env-disclosure-note');
  await disclosure.locator('summary').focus();
  await disclosure.locator('summary').press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
  await page.goto(`${offline}#/components/navigation/preview`);
  const navigationDisclosure = page.locator('.docs-preview details.env-disclosure-note');
  await navigationDisclosure.locator('summary').click();
  await expect(
    navigationDisclosure.getByRole('region', { name: 'Navigation item interaction states' }),
  ).toBeVisible();
});

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
    .getByRole('link', { includeHidden: true })
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
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
    for (const view of ['preview', 'usage']) {
      await page.evaluate((hash) => {
        location.hash = hash;
      }, `/foundations/${id}/${view}`);
      await expect(
        page.locator('.docs-page-header').getByRole('tab', { selected: true }),
      ).toHaveText(view[0].toUpperCase() + view.slice(1));
      if (view === 'preview') await expect(page.locator('.docs-preview')).toHaveCount(1);
    }
  }
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
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const mobileNavigation = page.getByRole('dialog', { name: 'Documentation', exact: true });
  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.getByRole('link', { name: 'Text fields', exact: true }).click();
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

test('overview centers its banner and switches between components and setup without a separate page', async ({
  page,
}) => {
  await page.goto(`${offline}#/overview`);
  const banner = page.locator('.docs-overview-hero');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('envUI');
  await expect(page.getByRole('tab', { name: 'Components', selected: true })).toBeVisible();
  await expect(page.locator('.docs-catalogue-grid').first()).toBeVisible();
  await expect(banner.getByRole('link')).toHaveCount(0);
  await expect(page.getByText('React components for envsemble')).toHaveCount(0);
  await expect(
    page.locator('.docs-sidebar').getByRole('link', { name: 'Getting started' }),
  ).toHaveCount(0);
  for (const width of [1440, 960, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const geometry = await banner.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const tabs = element.querySelector('[role="tablist"]')!.getBoundingClientRect();
      const logo = element.querySelector('.docs-overview-logo')!.getBoundingClientRect();
      return {
        center: (rect.left + rect.right) / 2,
        tabsCenter: (tabs.left + tabs.right) / 2,
        logoCenter: (logo.left + logo.right) / 2,
        tabsTop: tabs.top,
        logoBottom: logo.bottom,
      };
    });
    expect(Math.abs(geometry.tabsCenter - geometry.center)).toBeLessThan(1);
    expect(Math.abs(geometry.logoCenter - geometry.center)).toBeLessThan(1);
    expect(geometry.logoBottom).toBeLessThan(geometry.tabsTop);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('tab', { name: 'Get started' }).click();
  await expect(page).toHaveURL(/#\/overview\/get-started$/);
  await expect(page.getByRole('heading', { name: 'Install the private package' })).toBeVisible();
  await expect(page.locator('.docs-catalogue-grid')).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Components', selected: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('tab', { name: 'Get started', selected: true })).toBeVisible();
  await page.goto(`${offline}#/getting-started/usage?section=local-development`);
  await expect(page.getByRole('tab', { name: 'Get started', selected: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local live development' })).toBeInViewport();
  await expect(page.locator('.docs-page-navigation').getByRole('link')).toHaveAttribute(
    'href',
    '#/foundations/colors/usage',
  );
  await page.locator('.docs-page-navigation').getByRole('link').click();
  await expect(page.getByRole('tab', { name: 'Usage', selected: true })).toBeVisible();
  await expect(
    page.locator('.docs-page-navigation').getByRole('link', { name: 'Previous Overview' }),
  ).toHaveAttribute('href', '#/overview/get-started');
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
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({
    path: testInfo.outputPath('offline-theme-dark.png'),
    animations: 'disabled',
  });
  await page.evaluate(() => {
    location.hash = '/getting-started';
  });
  await expect(page.getByRole('tab', { name: 'Get started', selected: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install the private package' })).toBeVisible();
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
});
