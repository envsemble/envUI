import { test, expect, type Locator, type Route } from '@playwright/test';
import { siteDevUrl } from './helpers/Servers';
import {
  allPages,
  counterpartOf,
  docsTrail,
  docsTree,
  findPage,
  normalizeRoute,
  otherPartRoute,
  pagesOf,
  routeOfDocument,
} from '../../apps/site/src/navigation/SiteRoutes';
import { componentGroups } from '../../apps/site/src/pages/PageModel';
import { goTo } from './helpers/SiteSpecHelpers';

test('the addresses of the views before the catalogue and the Docs split open the pages they became', () => {
  const routes: Record<string, string> = {
    'components/button/overview': 'components/button',
    'components/button/props?section=props-Button-variant':
      'docs/components/button?section=props-Button-variant',
    'components/button/overview?section=keyboard': 'components/button?section=keyboard',
    'components/field/overview': 'docs/components/field',
    'foundations/colors/preview': 'foundations/colors',
    'foundations/colors/usage': 'docs/foundations/colors',
    'foundations/tokens': 'docs/tokens',
    // Nine foundations became six: merged pages open the page they joined.
    'foundations/scale': 'foundations/spacing',
    'foundations/scale/usage': 'docs/foundations/spacing',
    'docs/foundations/scale': 'docs/foundations/spacing',
    'foundations/composition': 'docs/customizing',
    'docs/foundations/composition': 'docs/customizing',
    'docs/customizing-colors': 'docs/customizing',
    'overview/components': 'overview',
    'overview/components?section=components-actions': 'components?section=components-actions',
    'overview/get-started': 'docs',
    'overview/get-started?skill=migrate&section=local-development': 'docs?section=coding-agents',
    // The agent skills' page went with the skills, and the guide for agents into setup.
    'docs/agent-skills': 'docs?section=coding-agents',
    'docs/agent-tooling': 'docs?section=coding-agents',
    // The setup guide is the Docs' home.
    'docs/setup': 'docs',
    'docs/setup?section=install-a-release': 'docs?section=install-a-release',
    // The codemods went, and developing envUI locally is a contributor's guide now.
    'docs/codemods': 'docs/migration',
    'docs/local-development': 'docs',
    // The agent benchmark went, and its page opens the overview.
    benchmark: 'overview',
    'get-started/migration': 'docs/migration',
    // The catalogue's Get started page is the setup guide, the Docs' home.
    'get-started': 'docs',
    'contributing/library-development': 'overview',
    // The catalogue's changelog is the Docs' now, with its release notes.
    changelog: 'docs/changelog',
    'changelog?section=release-0-7-0': 'docs/changelog?section=release-0-7-0',
    // Dev mode's page in the catalogue folded into its guide in the Docs.
    'dev-mode': 'docs/dev-mode',
    'dev-mode?section=opening-it': 'docs/dev-mode?section=opening-it',
    // Pages folded into another open it, at the section that holds them, and in the Docs its page.
    'components/bar': 'components/navigation-drawer',
    'components/rail/props': 'docs/components/navigation-drawer',
    'components/drawer': 'components/navigation-drawer',
    'components/page-header?section=sticky': 'components/page?section=sticky',
    'docs/components/page-header': 'docs/components/page',
    'patterns/feature-cards': 'components/card?section=feature-card',
    'docs/patterns/feature-cards': 'docs/components/card',
    'patterns/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'components/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'docs/patterns/search-trigger': 'docs/components/command-palette',
    // Patterns merged into others open the pattern they joined, in the catalogue and in the Docs.
    'patterns/window-frame': 'patterns/app-frame',
    'docs/patterns/window-frame': 'docs/patterns/app-frame',
    'components/window-frame': 'patterns/app-frame',
    'patterns/account-menu': 'patterns/account-and-organizations',
    'patterns/organization-switcher': 'patterns/account-and-organizations',
    'docs/patterns/organization-switcher': 'docs/patterns/account-and-organizations',
    // The content guidelines are the Writing guide in the Docs.
    'foundations/content': 'docs/writing',
    'docs/foundations/content': 'docs/writing',
  };
  for (const [from, to] of Object.entries(routes)) expect(normalizeRoute(from), from).toBe(to);
  // A link to dev mode's page in the catalogue opens its guide in the Docs.
  expect(routeOfDocument('dev-mode-overview')).toBe('docs/dev-mode');
  // Every page of both areas is its own route.
  for (const { path } of allPages) expect(normalizeRoute(path)).toBe(path);
});

test("each page of a subject leads to its page in the other part, and a page without one to the other part's start", () => {
  const paired = (kinds: string[]) =>
    pagesOf('catalogue').filter(({ kind }) => kinds.includes(kind));
  // Every component, pattern and foundation in the catalogue has its page in the Docs, which
  // leads back to it.
  for (const page of paired(['component', 'pattern', 'foundation'])) {
    const docs = counterpartOf(page);
    expect(docs, page.path).toBe(`docs/${page.path}`);
    expect(findPage(docs!)?.area, page.path).toBe('docs');
    expect(counterpartOf(findPage(docs!)!), docs).toBe(page.path);
    expect(otherPartRoute(page, 'catalogue')).toBe(docs);
  }
  // The catalogue's Overview and galleries lead to the Docs' home.
  for (const page of paired(['home', 'components', 'patterns'])) {
    expect(counterpartOf(page), page.path).toBeUndefined();
    expect(otherPartRoute(page, 'catalogue'), page.path).toBe('docs');
  }
  // A page of the Docs alone, such as a guide, the changelog or Field's, leads to the Overview.
  for (const path of [
    'docs',
    // Dev mode is the Docs' alone: its page in the catalogue folded into its guide.
    'docs/dev-mode',
    'docs/changelog',
    'docs/tokens',
    'docs/components/field',
  ])
    expect(otherPartRoute(findPage(path), 'docs'), path).toBe('overview');
  // A page that isn't there leads to the other part's start.
  expect(otherPartRoute(undefined, 'docs')).toBe('overview');
  expect(otherPartRoute(undefined, 'catalogue')).toBe('docs');
});

test("the Docs' navigation is a tree of sections and groups, and each page's trail follows it", () => {
  expect(docsTree.map(({ label }) => label)).toEqual([
    'Get started',
    'Guides',
    'Foundations',
    'Components',
    'Patterns',
    'Changelog',
  ]);
  const section = (label: string) => docsTree.find((entry) => entry.label === label)!;
  // Components by their group, in the catalogue's order, and patterns by their intent.
  expect(section('Components').pages).toEqual([]);
  expect(section('Components').groups.map(({ label }) => label)).toEqual(
    componentGroups.filter((group) => section('Components').groups.some((g) => g.label === group)),
  );
  expect(section('Patterns').groups.map(({ label }) => label)).toContain('Enter and change data');
  // Every page of the Docs is in the tree once.
  const inTree = docsTree.flatMap((entry) => [
    ...entry.pages,
    ...entry.groups.flatMap(({ pages }) => pages),
  ]);
  expect(inTree.map(({ path }) => path).sort()).toEqual(
    pagesOf('docs')
      .map(({ path }) => path)
      .sort(),
  );
  const trail = (path: string) => docsTrail(findPage(path)!).map(({ label }) => label);
  expect(trail('docs/components/button')).toEqual(['Docs', 'Components', 'Actions', 'Button']);
  expect(trail('docs/patterns/forms')).toEqual([
    'Docs',
    'Patterns',
    'Enter and change data',
    'Form layout and validation',
  ]);
  expect(trail('docs/foundations/spacing')).toEqual(['Docs', 'Foundations', 'Spacing & density']);
  // A section that is one page of its name is left out.
  expect(trail('docs/changelog')).toEqual(['Docs', 'Changelog']);
  // The home is the setup guide, where Docs leads nowhere.
  expect(trail('docs')).toEqual(['Docs', 'Get started', 'Install and set up']);
  expect(docsTrail(findPage('docs')!)[0]!.route).toBeUndefined();
  // Docs leads to their home; the section and group, which the navigation lists, lead nowhere.
  expect(docsTrail(findPage('docs/components/button')!).map(({ route }) => route)).toEqual([
    'docs',
    undefined,
    undefined,
    'docs/components/button',
  ]);
});

test("the pager and the drawer open a page at its top, and a section's address at the section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const body = page.locator('#site-main');
  const bottom = () => body.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  // Select's page shows its list open, partway down; the list scrolling its chosen option into
  // view once moved the whole page there.
  const listShown = () =>
    expect(page.locator('.catalogue-open-example .env-select-popup').first()).toBeVisible();
  await page.goto(`${siteDevUrl}/components/combobox`);
  await expect(page.locator('.site-page-navigation')).toBeVisible();
  await bottom();
  await page
    .locator('.site-page-navigation')
    .getByRole('link', { name: /Select/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
  await listShown();
  await expect(page.locator('.site-loading')).toHaveCount(0);
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
  // A page chosen in the drawer, from the foot of another, opens at its top too.
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Combobox', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Combobox');
  await bottom();
  await page
    .getByRole('navigation', { name: 'Components' })
    .getByRole('link', { name: 'Select', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
  await listShown();
  await expect(page.locator('.site-loading')).toHaveCount(0);
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
  // An address with a section, past the open list, still lands on the section.
  await goTo(page, '/components/combobox');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Combobox');
  await goTo(page, '/components/select#accessibility');
  await listShown();
  await expect(page.locator('.site-loading')).toHaveCount(0);
  const heading = page.locator('#accessibility');
  await expect
    .poll(() =>
      heading.evaluate(
        (element) =>
          element.getBoundingClientRect().top -
          document.getElementById('site-main')!.getBoundingClientRect().top,
      ),
    )
    .toBeLessThan(80);
  await expect(heading).toBeInViewport();
});

test("the Design and Code switch keeps the reader's section where the other page has it, else opens at the top", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const body = page.locator('#site-main');
  const partSwitch = page.getByRole('navigation', { name: 'Design or code' });
  // A section both pages of the pattern have, named by the address, as a contents link writes it.
  await page.goto(`${siteDevUrl}/docs/patterns/forms#sending`);
  await partSwitch.getByRole('link', { name: 'Design', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/patterns/forms#sending`);
  await expect(page.locator('#sending')).toBeInViewport();
  // The corner leads across too, as on every page, here to the same page in the Docs.
  await expect(
    page.locator('.site-page-actions .site-wide-only').getByRole('link', {
      name: 'Docs',
      exact: true,
    }),
  ).toHaveAttribute('href', '/docs/patterns/forms');
  // A section the other page doesn't have, such as the props, opens it at its top.
  await goTo(page, '/docs/components/button#props');
  await partSwitch.getByRole('link', { name: 'Design', exact: true }).click();
  await expect(page).toHaveURL(`${siteDevUrl}/components/button`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  expect(await body.evaluate((element) => element.scrollTop)).toBe(0);
});

test(
  'paths support direct links, old hash links and back/forward navigation',
  { tag: '@engines' },
  async ({ page }) => {
    // The hash address of an earlier release, such as a bookmark, is redirected to its path.
    await page.goto(`${siteDevUrl}/#/components/select/props`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Select');
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    const banner = page.locator('.site-page-header');
    await banner.getByRole('link', { name: 'Design', exact: true }).click();
    await expect(page).toHaveURL(/\/components\/select$/);
    await banner.getByRole('link', { name: 'Code', exact: true }).click();
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/components\/select$/);
    await expect(page.locator('.site-figure-section').first()).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/docs\/components\/select$/);
    await expect(page.getByRole('heading', { name: 'Props', exact: true })).toBeVisible();
  },
);

/** How far a page's element is below the top of the body that scrolls. */
const belowTop = (element: Locator) =>
  element.evaluate(
    (node) =>
      node.getBoundingClientRect().top -
      document.getElementById('site-main')!.getBoundingClientRect().top,
  );

test(
  'Back and Forward return to where the reader was, and a section addressed holds its place as the page loads',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const body = page.locator('#site-main');
    const scroll = () => body.evaluate((element) => element.scrollTop);
    // A later section's address opens at it, and it stays there as the parts above it load.
    await page.goto(`${siteDevUrl}/components/table#rules`);
    const rules = page.locator('#rules');
    await expect.poll(() => belowTop(rules)).toBeLessThan(80);
    const landed = await belowTop(rules);
    await expect(page.locator('.site-loading')).toHaveCount(0);
    // A part that lands moves it until the next frame, which holds it in place again.
    await expect.poll(async () => Math.abs((await belowTop(rules)) - landed)).toBeLessThan(2);
    // Partway down a page, a link opens the next at its top; Back returns to the same place.
    await goTo(page, '/components/button');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    await expect(page.locator('.site-loading, [data-site-pending]')).toHaveCount(0);
    await body.evaluate((element) => element.scrollTo(0, 2500));
    // The first heading in view, which the reader sees again at the same place.
    const inView = await body.evaluate((main) => {
      const top = main.getBoundingClientRect().top;
      return [...main.querySelectorAll('.site-page-column :is(h2, h3)[id]')].find(
        (heading) => heading.getBoundingClientRect().top >= top,
      )!.id;
    });
    const heading = page.locator(`[id="${inView}"]`);
    const before = await belowTop(heading);
    // A press that doesn't scroll the link into view first, as a reader's press doesn't.
    await page.locator('.site-page-navigation a').last().dispatchEvent('click');
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Button');
    await expect.poll(scroll).toBe(0);
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    await expect.poll(() => belowTop(heading)).toBeCloseTo(before, 0);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Button');
    await expect.poll(scroll).toBe(0);
  },
);

test('a pressed link whose page takes a moment shows a bar at the top of the page until it shows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${siteDevUrl}/components/button`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  const held: Route[] = [];
  await page.route(/\/generated\/pages\/link\.json/, (route) => void held.push(route));
  await page.locator('.site-sidebar').getByRole('link', { name: 'Link', exact: true }).click();
  const bar = page.getByRole('progressbar', { name: 'Loading page' });
  await expect(bar).toBeVisible();
  // Over the page's column, beside the navigation, along its top.
  const [box, body] = await Promise.all([
    bar.boundingBox(),
    page.locator('#site-main').boundingBox(),
  ]);
  expect(box?.y).toBe(0);
  expect(box?.x).toBeCloseTo(body!.x, 0);
  // The page before stays until the next one has loaded.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  for (const route of held) await route.continue();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Link');
  await expect(bar).toHaveCount(0);
});

test('a page the history shows before it has loaded is a skeleton of its shape, then where the reader was', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${siteDevUrl}/components/button`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
  // An entry of Table, kept 3000 pixels down, whose content this visit hasn't loaded.
  await page.evaluate(() =>
    history.pushState({ siteScroll: { top: 3000 } }, '', '/components/table'),
  );
  await page.goBack();
  const held: Route[] = [];
  await page.route(/\/generated\/pages\/table\.json/, (route) => void held.push(route));
  await page.goForward();
  const skeleton = page.locator('.site-page-skeleton');
  await expect(skeleton).toHaveAttribute('aria-busy', 'true');
  // It shows once the load has taken a moment, and the page's one status says what is loading.
  await expect(skeleton).toHaveAttribute('data-shown', '');
  await expect(page.getByRole('status').filter({ hasText: 'Loading page' })).toBeAttached();
  await expect(skeleton.locator('.site-page-banner-title')).toHaveText('Table');
  for (const route of held) await route.continue();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Table');
  await expect(skeleton).toHaveCount(0);
  // Back at 3000, give or take what figures above it settle by once they have measured, which
  // scroll anchoring keeps in view: this entry kept no heading to hold, as one the site writes does.
  await expect
    .poll(() => page.locator('#site-main').evaluate((main) => Math.abs(main.scrollTop - 3000)))
    .toBeLessThan(48);
});
