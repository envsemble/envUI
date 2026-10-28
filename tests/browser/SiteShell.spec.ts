import { test, expect } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import { requireSite, serveSite, siteUrl } from './helpers/HostedSite';
import { chooseScheme } from './helpers/CatalogueThemes';
import { renderLlmsText, renderSkill } from '../../scripts/site/SiteAgentFiles.ts';
import {
  allPages,
  sectionHome,
  catalogueSections,
} from '../../apps/site/src/navigation/SiteRoutes';
import { componentGroups } from '../../apps/site/src/pages/PageModel';
import { displayStorageKeys } from '../../apps/site/src/theme/DisplayStorage';
import { goTo } from './helpers/SiteSpecHelpers';

test('the hosted build opens every page of the catalogue and the Docs without network or script errors', async ({
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
    page.locator('.site-footer').getByRole('navigation', { name: 'Footer' }),
  ).toContainText('For agents');
  for (const { path, title, kind, area } of allPages) {
    await goTo(page, path === 'overview' ? '/' : `/${path}`);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveAccessibleName(
      kind === 'home' ? 'envUI' : title,
    );
    await expect(page.getByText('This page failed to render')).toHaveCount(0);
    // A page of the catalogue links into the Docs only through its banner's Docs button and the
    // Docs link at its top end, not from its content, the links generated from its frontmatter
    // included, such as Built from.
    if (area === 'catalogue' && kind !== 'home')
      await expect(page.locator('.site-main .site-article a[href^="/docs"]'), path).toHaveCount(0);
  }
  // A deep link loads its page, in the Docs too.
  await page.goto(`${siteUrl}/docs/setup`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
  await expect(page.locator('.env-code-block').first()).toContainText('@envsemble:registry');
  // The files for coding agents are at the root, as text rather than the page.
  const agentFiles = await page.evaluate(async () =>
    Promise.all(
      ['/SKILL.md', '/llms.txt'].map(async (path) => {
        const response = await fetch(path);
        return { type: response.headers.get('Content-Type'), text: await response.text() };
      }),
    ),
  );
  expect(agentFiles).toEqual([
    { type: 'text/markdown; charset=utf-8', text: renderSkill() },
    { type: 'text/plain; charset=utf-8', text: renderLlmsText() },
  ]);
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('1rem "envUI Geist"'))).toBe(true);
});

test('single previews retain state when the theme changes', async ({ page }) => {
  // The 0.x preview of text fields opens the TextField page, whose live examples follow the
  // documentation's theme.
  await page.goto(`${siteDevUrl}/components/input/preview`);
  const example = page.getByRole('group', { name: 'TextField example', exact: true });
  const projectName = example.getByRole('textbox', { name: 'Project name', exact: true });
  await projectName.fill('Winter release');
  await chooseScheme(page, 'dark');
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
  const mobileNavigation = page.getByRole('dialog', { name: 'Catalogue', exact: true });
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
      page.locator('#site-main').evaluate((main) => main.contains(document.activeElement)),
    )
    .toBe(true);
  await expect(projectName).toHaveValue('Winter release');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(mobileNavigation).toHaveCount(0);
  await expect(page.locator('.site-sidebar')).toBeVisible();
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
  await expect(disclosure).toHaveAttribute('data-env-theme', 'dark');
  await expect(disclosure.locator('details')).toHaveAttribute('open', '');
});

test('the navigation holds the wordmark and search, the page the other area and Display, and there is no top bar', async ({
  page,
}) => {
  for (const [address, other, brand] of [
    // In the catalogue the wordmark tops the rail; the Docs, which have no rail, put it in the
    // drawer.
    ['/components/menu', 'Docs', 'Catalogue'],
    ['/docs/components/menu', 'Catalogue', 'Docs'],
  ] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${siteDevUrl}${address}`);
    await expect(page.getByRole('banner')).toHaveCount(0);
    const wordmark = page
      .getByRole('navigation', { name: brand })
      .getByRole('link', { name: /^envUI( Docs)? home$/ });
    const search = page.locator('.site-sidebar').getByRole('button', { name: /^Search/ });
    await expect(wordmark, address).toBeInViewport();
    await expect(search, address).toBeInViewport();
    // The wordmark and search share the first row.
    const [mark, field] = await Promise.all([wordmark.boundingBox(), search.boundingBox()]);
    expect(Math.abs(mark!.y + mark!.height / 2 - (field!.y + field!.height / 2))).toBeLessThan(4);
    expect(mark!.x + mark!.width).toBeLessThanOrEqual(field!.x);
    // Search is as wide as its content; in the catalogue it is centred in the drawer, and the
    // drawer's first item starts level with the rail's first destination.
    const drawer = (await page.locator('.site-sidebar').boundingBox())!;
    expect(field!.width).toBeLessThan(drawer.width - 24);
    // The list may be scrolled to the current page: where it starts is where its first item does.
    const first = (await page.locator('.site-sidebar .env-drawer-list').boundingBox())!;
    if (brand === 'Catalogue') {
      const left = field!.x - drawer.x;
      const right = drawer.x + drawer.width - (field!.x + field!.width);
      expect(Math.abs(left - right), address).toBeLessThan(2);
      const destination = (await page
        .locator('.catalogue-rail .env-rail-item')
        .first()
        .boundingBox())!;
      expect(Math.abs(first.y - destination.y), address).toBeLessThan(1);
    }
    // The other area and the Display menu are ghost buttons at the page's top end.
    const actions = page.locator('.site-page-actions');
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
      [page.locator('.site-compact-controls').getByRole('button', { name: /^Search/ }), true],
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
    const sheet = page.getByRole('dialog', {
      name: address.startsWith('/docs') ? 'Docs' : 'Catalogue',
    });
    await expect(sheet.getByRole('button', { name: /^Search/ })).toBeInViewport();
    await page.keyboard.press('Escape');
  }
});

test('settings stored under the keys of before move to their keys now, and still apply', async ({
  page,
}) => {
  // A reader's settings from when the site was called the catalogue, and its drawer the site's.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', 'yes');
    localStorage.setItem('envui-catalogue-theme', 'dark');
    localStorage.setItem('envui-catalogue-scale', 'compact');
    localStorage.setItem('envui-catalogue-drawer-width-site', '25');
  });
  await page.goto(`${siteDevUrl}/components/button`);
  await expect(page.locator('.site-app')).toHaveAttribute('data-env-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-env-scale', 'compact');
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored).toMatchObject({
    [displayStorageKeys.theme]: 'dark',
    [displayStorageKeys.scale]: 'compact',
    'envui-site-drawer-width-catalogue': '25',
  });
  expect(Object.keys(stored).filter((key) => key.startsWith('envui-catalogue-'))).toEqual([]);
});

test("every label and heading of the catalogue's and the Docs' drawers fits on one line at the default width", async ({
  page,
}) => {
  // A fresh page has no width stored, so each drawer starts at its default width.
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of [...catalogueSections.map((section) => sectionHome(section).path), 'docs']) {
    await page.goto(`${siteDevUrl}/${path}`);
    const drawer = page.locator('.site-sidebar');
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
  await page.goto(`${siteDevUrl}/components/tree`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tree');
  // The rail marks the page's destination, and the drawer beside it lists the destination's pages.
  await expect(
    page.getByRole('navigation', { name: 'Catalogue' }).locator('[aria-current="page"]'),
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
  // A destination of the rail opens its first page, the page of all its pages, and the drawer
  // lists its pages.
  await page
    .getByRole('navigation', { name: 'Catalogue' })
    .getByRole('link', { name: 'Foundations', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foundations');
  const foundations = page.getByRole('navigation', { name: 'Foundations' });
  await expect(foundations.getByRole('link', { name: 'Typography' })).toBeVisible();
  await foundations.getByRole('link', { name: 'Colors & themes', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  // The Docs have a navigation of their own, and the switch at the top end leads to the same
  // subject in the other part and back.
  await page.locator('.site-page-actions').getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/docs/foundations/colors`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Colors & themes');
  await expect(page.getByRole('navigation', { name: 'Catalogue' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Docs' }).getByRole('link', { name: 'Design tokens' }),
  ).toBeVisible();
  await page
    .locator('.site-page-actions')
    .getByRole('link', { name: 'Catalogue', exact: true })
    .click();
  await expect(page).toHaveURL(`${siteDevUrl}/foundations/colors`);
  await expect(page.getByRole('navigation', { name: 'Catalogue' })).toBeVisible();
});

test("a catalogue page has its contents beside it from 56rem, in the Docs' column, and a banner as wide as theirs", async ({
  page,
}) => {
  const contents = page.getByRole('navigation', { name: 'On this page' });
  const topLevel = () =>
    contents.evaluate((navigation) =>
      [...navigation.querySelector('ol, ul')!.children].map(
        (item) => item.querySelector(':scope > a')?.textContent,
      ),
    );
  // A component's page lists its sections, with the rules under Rules, and marks where the reader
  // is; a link scrolls to its section.
  await page.goto(`${siteDevUrl}/components/button`);
  await expect(contents).toBeVisible();
  await expect
    .poll(topLevel)
    .toEqual(['Overview', 'Variants', 'Anatomy', 'Behaviour', 'Rules', 'Accessibility', 'Related']);
  const rules = contents.getByRole('listitem').filter({
    has: page.getByRole('link', { name: 'Rules', exact: true }),
  });
  await expect(rules.getByRole('link', { name: 'Use it when', exact: true })).toBeVisible();
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Overview');
  await contents.getByRole('link', { name: 'Rules', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/components/button#rules`);
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Rules');
  // The banner, the page's column and the contents beside it are laid out as in the Docs: the
  // banner is its column less the gutters, level with the top of the contents, and the contents
  // take the rest of the pane, so a banner is as wide as the Docs' wherever the pane and the
  // contents, which fit their longest label, are as wide.
  const layout = () =>
    page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const [banner, column, contents, pane] = [
        '.site-page-banner',
        '.site-page-column',
        '.site-contents',
        '.site-page-layout',
      ].map(box);
      return {
        rest: pane.width - banner.width - contents.width,
        inset: banner.left - column.left,
        end: column.right - banner.right,
        level: contents.top - banner.top,
      };
    });
  await contents.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Overview');
  const catalogue = await layout();
  expect(catalogue.end).toBeCloseTo(catalogue.inset, 1);
  await goTo(page, '/docs/components/button');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  await expect(contents).toBeVisible();
  await expect(async () => {
    const docs = await layout();
    for (const key of Object.keys(catalogue) as (keyof typeof catalogue)[])
      expect(docs[key], key).toBeCloseTo(catalogue[key], 1);
  }).toPass();
  // The index pages list their groups alone, not every tile; the overview has no contents.
  await goTo(page, '/components');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
  await expect.poll(topLevel).toEqual(componentGroups);
  await expect(contents.locator('li li')).toHaveCount(0);
  await goTo(page, '/');
  await expect(page.locator('.catalogue-overview-hero')).toBeVisible();
  await expect(contents).toHaveCount(0);
  // A pane narrower than 56rem leaves them out, as in the Docs.
  await goTo(page, '/patterns/forms');
  await expect(contents).toBeVisible();
  await page.setViewportSize({ width: 1180, height: 900 });
  await expect(contents).toBeHidden();
});

test("a catalogue page's contents list none of its figures' headings, a do and don't pair's included", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const contents = page.getByRole('navigation', { name: 'On this page' });
  // Card's do and don't pairs hold cards with headings of their own.
  await page.goto(`${siteDevUrl}/components/card`);
  await expect(contents.getByRole('link', { name: 'Rules', exact: true })).toBeVisible();
  await expect(page.locator('.site-verdict-stage :is(h2, h3)').first()).toBeAttached();
  const inFigures = await contents.evaluate((navigation) =>
    [...navigation.querySelectorAll('a[href^="#"]')].flatMap((link) => {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      return heading?.closest('.site-live-example, .site-verdict-stage, .site-anatomy-stage')
        ? [link.textContent]
        : [];
    }),
  );
  expect(inFigures).toEqual([]);
});

test('the theme in the Display menu switches the whole page and keeps the canvas full height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1400 });
  await page.goto(`${siteDevUrl}/components/checkbox/preview`);
  const app = page.locator('.site-app');
  const panes = page.locator('.catalogue-specimen-area');
  // The 0.x preview opens the Checkbox page, whose live example follows the theme with its state.
  const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
  const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
  await archived.check();
  await chooseScheme(page, 'dark');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveAttribute('data-env-theme', 'dark');
  await expect(example).toHaveCount(1);
  await expect(archived).toBeChecked();
  await expect(page.locator('.docs-theme-label')).toHaveCount(0);

  for (const width of [1920, 960, 390]) {
    await page.setViewportSize({ width, height: 1400 });
    // The content fills the frame's body, which fills the window below the top bar.
    const canvas = await page.locator('.site-main').evaluate((main) => {
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
  // The role swatches show each role in the reader's theme, and follow it.
  const pageSwatch = page.locator('.catalogue-role-swatch > span').first();
  const swatchColor = () =>
    pageSwatch.evaluate((swatch) => getComputedStyle(swatch).backgroundColor);
  const darkColor = await swatchColor();
  await chooseScheme(page, 'light');
  await expect(app).toHaveAttribute('data-env-theme', 'light');
  await expect.poll(swatchColor).not.toBe(darkColor);
  await chooseScheme(page, 'dark');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  // The setup guide, in the Docs, keeps the theme.
  await goTo(page, '/getting-started');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the private package');
  await expect(app).toHaveAttribute('data-env-theme', 'dark');
  await expect(panes).toHaveCount(0);
});
