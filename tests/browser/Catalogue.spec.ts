import { test, expect } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
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
  const { docs } = JSON.parse(readFileSync('packages/codemods/src/maps/v1.json', 'utf8'));
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
  await expect(page).toHaveURL(/#\/components\/surface\/usage$/);
  await expect(page.getByRole('heading', { name: 'Guidelines', exact: true })).toBeVisible();

  await page.goto(`${offline}#/overview/get-started`);
  await page
    .locator('#documentation')
    .getByRole('link', { name: 'Develop envUI locally', exact: true })
    .click();
  await expect(page).toHaveURL(/document=local-development/);
  await expect(
    page
      .locator('#documentation')
      .getByRole('heading', { name: 'Develop envUI locally', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#documentation')).toContainText('npm run dev:library');
});

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

test('live examples keep links in place, show their source, and matrices sit in the guidelines', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/button/overview`);
  const hash = await page.evaluate(() => location.hash);
  // Links in an example keep their semantics without leaving the documentation.
  const destinations = page.getByRole('group', { name: 'Destinations example', exact: true });
  await destinations.getByRole('link', { name: 'Read the guide', exact: true }).press('Enter');
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  await destinations
    .getByRole('link', { name: 'Read help', exact: true })
    .click({ modifiers: ['Control'] });
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  // Every example shows the source of its file, ready to copy.
  const code = destinations.locator('xpath=following-sibling::details[1]');
  await code.locator('summary').click();
  await expect(code.locator('.env-code-block')).toContainText(
    "import { ActionGroup, Button } from '@envsemble/envui';",
  );
  await expect(code.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
  // Catalogue-only specimens, such as the forced interaction states, are in the guidelines.
  await page.getByRole('tab', { name: 'Guidelines', exact: true }).click();
  const disclosure = page.locator('.docs-preview details.env-disclosure');
  await disclosure.locator('summary').focus();
  await disclosure.locator('summary').press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.getByRole('region', { name: 'Button interaction states' })).toBeVisible();
  await page.goto(`${offline}#/components/nav-list/preview`);
  const navigationDisclosure = page.locator('.docs-preview details.env-disclosure');
  await navigationDisclosure.locator('summary').click();
  await expect(
    navigationDisclosure.getByRole('region', { name: 'Navigation item interaction states' }),
  ).toBeVisible();
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

test('pagers center pairs and single destinations at every page width', async ({ page }) => {
  await page.goto(`${offline}#/components/pager/preview`);
  const groups = page.locator('.env-pager');
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
    for (const title of nav.querySelectorAll('.env-pager-link-title')) {
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
  const preview = page.locator('.docs-preview');
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
  await navigationTrigger.click();
  const mobileNavigation = page.getByRole('dialog', { name: 'Documentation', exact: true });
  await expect(mobileNavigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(mobileNavigation).toHaveCount(0);
  await expect(navigationTrigger).toBeFocused();
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

test('old addresses are replaced by the address of the page they open', async ({ page }) => {
  await page.goto(`${offline}#/components/buttons/usage`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect
    .poll(() => page.evaluate(() => location.hash))
    .toBe('#/components/button/guidelines');
  await page.goto(`${offline}#/components/tables/usage?section=keyboard`);
  await expect
    .poll(() => page.evaluate(() => location.hash))
    .toBe('#/components/table/guidelines?section=keyboard');
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

test('removing a row moves focus to the next row, not the page', async ({ page }) => {
  await page.goto(`${offline}#/components/button/overview`);
  const members = page.getByRole('group', { name: 'Confirm in place example', exact: true });
  await members.getByRole('button', { name: 'Remove', exact: true }).first().click();
  // A second press counts once the double-press guard has passed.
  await page.waitForTimeout(450);
  await members.getByRole('button', { name: 'Remove Alex?', exact: true }).click();
  await expect(members.getByRole('button', { name: 'Remove', exact: true }).first()).toBeFocused();
  await expect(members.getByText('Alex Morgan')).toHaveCount(0);
  await members.getByRole('button', { name: 'Delete draft', exact: true }).click();
  await page.waitForTimeout(450);
  await members.getByRole('button', { name: 'Delete draft?', exact: true }).click();
  await expect(members.getByRole('button', { name: 'Draft deleted. Restore' })).toBeFocused();

  await page.goto(`${offline}#/components/menu/overview`);
  const documents = page.getByRole('group', { name: 'Context menu example', exact: true });
  for (const [name, next] of [
    ['Quarterly report', 'More actions for Meeting notes'],
    ['Budget', 'More actions for Meeting notes'],
  ]) {
    await documents.getByRole('button', { name: `More actions for ${name}`, exact: true }).click();
    await page.getByRole('menuitem', { name: /^Delete/ }).click();
    await expect(documents.getByRole('button', { name: next, exact: true })).toBeFocused();
  }
  await documents.getByRole('button', { name: 'More actions for Meeting notes' }).click();
  await page.getByRole('menuitem', { name: /^Delete/ }).click();
  await expect(documents.getByRole('list', { name: 'Documents', exact: true })).toBeFocused();
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
  await hero.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(hero.getByText('The example could not load')).toHaveCount(0);
  await expect(hero.getByRole('button').first()).toBeVisible();
});

test('offline hashes support direct links and back/forward navigation', async ({ page }) => {
  await page.goto(`${offline}#/components/select/usage`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
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
  await expect(page.getByRole('heading', { name: 'Agent guidance', exact: true })).toBeInViewport();
  await expect(page.getByRole('tab', { name: 'Migrate to envUI', selected: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Migrate an interface to envUI' })).toBeVisible();
  await page.getByRole('link', { name: 'envui-use', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Use envUI', selected: true })).toBeVisible();
  await page
    .locator('#documentation')
    .getByRole('link', { name: 'TextField', exact: true })
    .click();
  // A link to a page on the template opens its overview.
  await expect(page).toHaveURL(/#\/components\/text-field\/overview$/);
  await page.goto(`${offline}#/overview/get-started`);
  await expect(page.getByRole('heading', { name: 'Install the private package' })).toBeVisible();
  const overviewNext = page
    .locator('.docs-page-navigation')
    .getByRole('link', { name: 'Up next Colors & themes' });
  await expect(overviewNext).toHaveAttribute('href', '#/foundations/colors/usage');
  await overviewNext.click();
  await expect(page.getByRole('tab', { name: 'Usage', selected: true })).toBeVisible();
  await expect(
    page.locator('.docs-page-navigation').getByRole('link', { name: 'Previous Overview' }),
  ).toHaveAttribute('href', '#/overview/get-started');
});

test('offline theme toggle switches the whole page and keeps the canvas full height', async ({
  page,
}) => {
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

test('the code copy action follows the app theme with the code it copies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${catalogueUrl}/#/components/code`);
  for (const appTheme of ['light', 'dark']) {
    if (appTheme === 'dark')
      await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    const copy = page.getByRole('button', { name: 'Copy code' }).first();
    await expect(copy.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      appTheme,
    );
    // The icon stays legible on the code background of either theme.
    const contrast = () =>
      copy.evaluate((button) => {
        const luminance = (color: string) => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true })!;
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
          const linear = (value: number) => {
            const channel = value / 255;
            return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
        };
        const block = button.closest('.env-code-block')!;
        const [lighter, darker] = [
          luminance(getComputedStyle(button).color),
          luminance(getComputedStyle(block).backgroundColor),
        ].sort((a, b) => b - a);
        return (lighter + 0.05) / (darker + 0.05);
      });
    // Measured once the theme change has settled.
    await expect.poll(contrast, appTheme).toBeGreaterThan(4.5);
  }
});
