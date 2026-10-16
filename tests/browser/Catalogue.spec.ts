import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { moduleFiles, requireSite, serveSite, siteUrl } from './HostedSite';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

test('Markdown renders a document and edits one, including old editor bookmarks', async ({
  page,
}) => {
  // The 0.x route of the Markdown editor opens the Markdown page on the template.
  await page.goto(`${offline}#/components/markdown-editor/preview`);
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Overview',
  );
  await expect(
    page.getByRole('heading', { name: 'Markdown', exact: true, level: 1 }),
  ).toBeVisible();
  const rendered = page.getByRole('group', { name: 'Markdown example', exact: true });
  await expect(rendered.getByRole('heading', { name: 'Launch checklist' })).toBeVisible();
  await expect(rendered.locator('kbd.env-kbd')).toHaveText(['Ctrl', 'S']);
  const editor = page.getByRole('group', { name: 'Write and preview example', exact: true });
  const source = editor.getByRole('textbox', { name: 'Description' });
  const draft = '## Edited draft\n\nA **new** paragraph.';
  await source.fill(draft);
  await editor.getByRole('tab', { name: 'Preview', exact: true }).click();
  await expect(editor.getByRole('heading', { name: 'Edited draft' })).toBeVisible();
  await editor.getByRole('tab', { name: 'Write', exact: true }).click();
  await expect(source).toHaveValue(draft);
  // A Usage bookmark opens the guidelines.
  await page.goto(`${offline}#/components/markdown-editor/usage`);
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Guidelines',
  );
  await expect(page.getByRole('heading', { name: 'Anatomy', exact: true })).toBeVisible();
  expect(references.filter(({ id }) => id === 'markdown')).toHaveLength(1);
  expect(references.some(({ id }) => id === 'markdown-editor')).toBe(false);
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
  await page.goto(`${offline}#/components/nav-list/guidelines`);
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
  // The live examples and the page's own pager in its footer.
  await page.goto(`${offline}#/components/pager/overview`);
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
  const longDestinations = page.getByRole('navigation', { name: 'Long destinations' });
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
    location.hash = '/components/radio/guidelines';
  });
  await expect(footer.getByRole('link').last()).toHaveAttribute(
    'href',
    '#/components/select/guidelines',
  );
  await footer.getByRole('link').last().click();
  await expect(page.locator('.docs-page-header').getByRole('tab', { selected: true })).toHaveText(
    'Guidelines',
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
  // It opens every view of every page, over 20 s in Firefox on its own: more than the default
  // timeout leaves once the other engines share the machine.
  test.setTimeout(90_000);
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

test('old addresses are replaced by the address of the page they open', async ({ page }) => {
  await page.goto(`${offline}#/components/buttons/usage`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect
    .poll(() => page.evaluate(() => location.hash))
    .toBe('#/components/button/guidelines');
  await page.goto(`${offline}#/components/tables/usage?section=keyboard`);
  await expect
    .poll(() => page.evaluate(() => location.hash))
    .toBe('#/components/table/accessibility?section=keyboard');
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

test('arrowing between the overview views keeps focus on the tabs and adds no history', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/link/overview`);
  await page.goto(`${offline}#/overview/components`);
  const before = await page.evaluate(() => history.length);
  const tabs = page.getByRole('tablist', { name: 'Overview views', exact: true });
  await tabs.getByRole('tab', { name: 'Components', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  const started = tabs.getByRole('tab', { name: 'Get started', exact: true });
  await expect(started).toHaveAttribute('aria-selected', 'true');
  await expect(started).toBeFocused();
  expect(await page.evaluate(() => location.hash)).toBe('#/overview/get-started');
  expect(await page.evaluate(() => history.length)).toBe(before);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Link');
});

test('the agent guidance tabs keep focus, and only a chosen tab is a step in the history', async ({
  page,
}) => {
  await page.goto(`${offline}#/overview/get-started`);
  const before = await page.evaluate(() => history.length);
  const tabs = page.getByRole('tablist', { name: 'Agent guidance', exact: true });
  const use = tabs.getByRole('tab', { name: 'Use envUI', exact: true });
  const migrate = tabs.getByRole('tab', { name: 'Migrate to envUI', exact: true });
  await use.focus();
  await page.keyboard.press('ArrowRight');
  await expect(migrate).toHaveAttribute('aria-selected', 'true');
  await expect(migrate).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(use).toHaveAttribute('aria-selected', 'true');
  await expect(use).toBeFocused();
  expect(await page.evaluate(() => location.hash)).toBe(
    '#/overview/get-started?skill=use&section=local-development',
  );
  expect(await page.evaluate(() => history.length)).toBe(before);
  // A tab pressed is a step in the history, and focus stays on it.
  await migrate.click();
  await expect(migrate).toBeFocused();
  expect(await page.evaluate(() => history.length)).toBe(before + 1);
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
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(hero.getByText('The example could not load')).toHaveCount(0);
  // Focus stays where the example is, rather than falling to the page.
  expect(await hero.evaluate((group) => group.contains(document.activeElement))).toBe(true);
});

for (const failure of ['missing', 'aborted'] as const) {
  test(`in the hosted build, an example whose file is ${failure} offers a reload, which loads it`, async ({
    page,
  }) => {
    // A build's chunk that failed stays failed until the page reloads, in Chromium and WebKit, and
    // in WebKit even then, unless it is fetched again.
    requireSite();
    const files = moduleFiles('src/examples/button/CreateProject.tsx');
    let failing = true;
    await serveSite(page, { failing: (pathname) => failing && files.includes(pathname), failure });
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
}

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

test('in the hosted build, a reload loads an example again whatever files failed as it opened', async ({
  page,
}) => {
  // WebKit keeps every failed file failed across reloads unless the reload fetches it first.
  requireSite();
  const { hero, set } = await openFailingButtonPage(page);
  set('up');
  await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
});

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

test('in the hosted build, a reload from an overview that failed keeps the page while the connection is down', async ({
  page,
  context,
}) => {
  requireSite();
  let down = false;
  await serveSite(page, { failing: () => down, failure: 'aborted', script: breakOverview });
  await page.goto(`${siteUrl}/#/overview`);
  const main = page.getByRole('main');
  const alert = main.locator('.env-alert');
  await expect(alert.getByText('Broken page')).toBeVisible();
  await page.evaluate(() => Object.assign(window, { stillHere: true }));
  await context.setOffline(true);
  down = true;
  await alert.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(alert.getByRole('status')).toHaveText(
    'The connection seems to be down. Reload the page once it is back.',
  );
  expect(await page.evaluate(() => 'stillHere' in window)).toBe(true);
  await context.setOffline(false);
  down = false;
  await Promise.all([
    page.waitForEvent('load'),
    alert.getByRole('button', { name: 'Reload the page', exact: true }).click(),
  ]);
  expect(await page.evaluate(() => 'stillHere' in window)).toBe(false);
  await expect(alert.getByText('Broken page')).toBeVisible();
});

for (const down of ['offline', 'unreachable'] as const) {
  test(`in the hosted build, a reload with the connection ${down} keeps the page and says so`, async ({
    page,
    context,
  }) => {
    requireSite();
    const files = moduleFiles('src/examples/button/CreateProject.tsx');
    let connection: 'failing' | 'down' | 'up' = 'failing';
    await serveSite(page, {
      failing: (pathname) =>
        connection === 'down' || (connection === 'failing' && files.includes(pathname)),
      failure: 'aborted',
    });
    await page.goto(`${siteUrl}/#/components/button/overview`);
    const hero = page.getByRole('group', { name: 'Button example', exact: true });
    await expect(hero.getByText('The example could not load')).toBeVisible();
    // A reload would replace the page, and this mark with it.
    await page.evaluate(() => Object.assign(window, { stillHere: true }));
    // The browser knows it is offline, or it doesn't and no file arrives.
    if (down === 'offline') await context.setOffline(true);
    connection = 'down';
    await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
    await expect(hero.getByRole('status')).toHaveText(
      'The connection seems to be down. Reload the page once it is back.',
    );
    expect(await page.evaluate(() => 'stillHere' in window)).toBe(true);
    await context.setOffline(false);
    connection = 'up';
    await hero.getByRole('button', { name: 'Reload the page', exact: true }).click();
    await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  });
}

test('in the hosted build, an icon list that fails to load offers a reload, which loads it', async ({
  page,
}) => {
  requireSite();
  const files = moduleFiles('src/previews/foundations/Icons.tsx');
  let failing = true;
  await serveSite(page, {
    failing: (pathname) => failing && files.includes(pathname),
    failure: 'missing',
  });
  await page.goto(`${siteUrl}/#/foundations/icons/preview`);
  const main = page.getByRole('main');
  await expect(main.getByText('The icon list could not load')).toBeVisible();
  await expect(main.getByText('This page failed to render')).toHaveCount(0);
  failing = false;
  await main.getByRole('button', { name: 'Reload the page', exact: true }).click();
  await expect(main.getByRole('searchbox').first()).toBeVisible();
  await expect(main.getByText('The icon list could not load')).toHaveCount(0);
});

for (const [what, module, address] of [
  ['icon list', 'src/previews/foundations/Icons.tsx', '#/foundations/icons/preview'],
  ['icon usage', 'src/usage/IconUsage.tsx', '#/foundations/icons/usage?icon=Add'],
] as const) {
  test(`an ${what} that fails to load says so in place, and loads again on request`, async ({
    page,
  }) => {
    const file = `**/${module}*`;
    await page.route(file, (route) => route.abort());
    await page.goto(`${catalogueUrl}/${address}`);
    const main = page.getByRole('main');
    await expect(main.getByText(`The ${what} could not load`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Icons & assets');
    await page.unroute(file);
    await main.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(main.getByText(`The ${what} could not load`)).toHaveCount(0);
    // A visit elsewhere and back keeps it loaded.
    await page.goto(`${catalogueUrl}/#/components/badge/overview`);
    await page.goto(`${catalogueUrl}/${address}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Icons & assets');
    await expect(main.getByText(`The ${what} could not load`)).toHaveCount(0);
  });
}

test('code that fails to load is asked for once, not on every render', async ({ page }) => {
  const source = /\/src\/examples\/button\/CreateProject\.tsx\?raw/;
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (/uncached promise/i.test(message.text())) warnings.push(message.text());
  });
  await page.route(source, (route) => route.abort());
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
  const entry = page.locator('.docs-live-example-entry').first();
  await entry.getByText('Code', { exact: true }).click();
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
  await page.locator('.docs-theme-toggle').evaluate((toggle: HTMLElement) => toggle.click());
  await expect(page.locator('.docs-app')).toHaveAttribute('data-env-theme', 'dark');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
});

test('retrying the code after the example returns focus to the code', async ({ page }) => {
  const files = '**/src/examples/button/CreateProject.tsx*';
  await page.route(files, (route) => route.abort());
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
  const entry = page.locator('.docs-live-example-entry').first();
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  const code = entry.locator('.docs-live-example-code');
  await entry.getByText('Code', { exact: true }).click();
  await expect(hero.getByText('The example could not load')).toBeVisible();
  await expect(code.getByText('The code could not load')).toBeVisible();
  await page.unroute(files);
  await hero.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(hero.getByRole('button', { name: 'Create project', exact: true })).toBeVisible();
  await code.getByRole('button', { name: 'Try again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(code.getByText('CreateProject.tsx', { exact: true })).toBeVisible();
  expect(await code.evaluate((element) => element.contains(document.activeElement))).toBe(true);
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
  const entry = page.locator('.docs-live-example-entry').first();
  await entry.getByText('Code', { exact: true }).click();
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

test('an example that fails after a press takes the focus it dropped', async ({ page }) => {
  await breakOnPress(page, '**/src/examples/button/CreateProject.tsx', 'default');
  await page.goto(`${catalogueUrl}/#/components/button/overview`);
  const hero = page.getByRole('group', { name: 'Button example', exact: true });
  await hero.getByRole('button', { name: 'Break', exact: true }).focus();
  await page.keyboard.press('Enter');
  const alert = hero.locator('.env-alert');
  await expect(alert).toContainText('This example failed to render');
  await expect(alert).toBeFocused();
});

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

test('each Markdown table region is named after its heading', async ({ page }) => {
  await page.goto(`${offline}#/components/menu/accessibility`);
  const region = page.getByRole('region', { name: 'Keyboard table', exact: true });
  await expect(region).toBeVisible();
  await expect(region.getByRole('table')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Table', exact: true })).toHaveCount(0);
});

test('offline hashes support direct links and back/forward navigation', async ({ page }) => {
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
  // The pager follows the navigation: the guides of Get started, then the foundations.
  const overviewNext = page
    .locator('.docs-page-navigation')
    .getByRole('link', { name: 'Up next Migrate an interface to envUI' });
  await expect(overviewNext).toHaveAttribute('href', '#/get-started/migration');
  await overviewNext.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Migrate an interface to envUI');
  await expect(
    page.locator('.docs-page-navigation').getByRole('link', { name: 'Previous Overview' }),
  ).toHaveAttribute('href', '#/overview/get-started');
  await page.goto(`${offline}#/get-started/local-development`);
  const foundationsNext = page
    .locator('.docs-page-navigation')
    .getByRole('link', { name: 'Up next Colors & themes' });
  await expect(foundationsNext).toHaveAttribute('href', '#/foundations/colors/usage');
  await foundationsNext.click();
  await expect(page.getByRole('tab', { name: 'Usage', selected: true })).toBeVisible();
});

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

test('highlighted code takes its high-contrast colors where the contrast is high', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/#/components/code/overview`);
  const token = page.locator('.docs-live-example .env-code-block code span').first();
  await expect(token).toBeVisible();
  const colors = () =>
    token.evaluate((span) => {
      const style = getComputedStyle(span);
      const probe = document.createElement('span');
      span.parentElement!.append(probe);
      const resolve = (value: string) => {
        probe.style.color = value;
        return getComputedStyle(probe).color;
      };
      const result = {
        color: style.color,
        standard: resolve(span.style.getPropertyValue('--env-code-token')),
        high: resolve(span.style.getPropertyValue('--env-code-token-high')),
      };
      probe.remove();
      return result;
    });
  const standard = await colors();
  expect(standard.high).not.toBe(standard.standard);
  expect(standard.color).toBe(standard.standard);
  // The system asks for more contrast, and the Theme follows it.
  // Firefox restyles for the contrast preference only on load.
  await page.emulateMedia({ contrast: 'more' });
  await page.reload();
  await expect(token).toBeVisible();
  await expect.poll(async () => (await colors()).color).toBe(standard.high);
  // A Theme that keeps the standard contrast keeps the standard colors, whatever the system asks.
  await token.evaluate((span) =>
    span.closest('.env-theme')!.setAttribute('data-env-contrast', 'standard'),
  );
  await expect.poll(async () => (await colors()).color).toBe(standard.standard);
  await page.emulateMedia({ contrast: 'no-preference' });
  await page.reload();
  await expect(token).toBeVisible();
  await token.evaluate((span) =>
    span.closest('.env-theme')!.setAttribute('data-env-contrast', 'high'),
  );
  await expect.poll(async () => (await colors()).color).toBe(standard.high);
});
