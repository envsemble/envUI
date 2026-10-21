import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

// Bar, Rail and Drawer over the same destinations, in tests/fixture/Navigation.tsx.

const iconPaths = (item: Locator) =>
  item
    .locator('.env-icon path')
    .evaluateAll((paths) => paths.map((path) => path.getAttribute('d')));

test('each form is a navigation landmark, named by its label, its heading or Main', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  for (const name of ['Mail drawer', 'Mail rail', 'Mail bar', 'Main', 'Routed'])
    await expect(scope.getByRole('navigation', { name, exact: true })).toHaveCount(1);
  await expect(scope.locator('nav.env-drawer[aria-label="Mail drawer"]')).toHaveCount(1);
  await expect(scope.locator('nav.env-rail[aria-label="Mail rail"]')).toHaveCount(1);
  await expect(scope.locator('nav.env-bar[aria-label="Mail bar"]')).toHaveCount(1);
});

test('the current destination reports aria-current and fills its icon, also wrapped', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  for (const theme of ['light', 'dark']) {
    const drawer = page
      .getByTestId(`navigation-${theme}`)
      .getByRole('navigation', { name: 'Icon fill' });
    const home = drawer.getByRole('button', { name: 'Home' });
    const settings = drawer.getByRole('button', { name: 'Settings' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(home).toHaveAttribute('data-current', '');
    await expect(settings).not.toHaveAttribute('aria-current');
    const homeFilled = await iconPaths(home);
    const settingsOutlined = await iconPaths(settings);
    await settings.click();
    await expect(settings).toHaveAttribute('aria-current', 'page');
    await expect(home).not.toHaveAttribute('aria-current');
    expect(await iconPaths(home)).not.toEqual(homeFilled);
    expect(await iconPaths(settings)).not.toEqual(settingsOutlined);
    // Each icon is drawn once: a filled symbol replaces the outlined one.
    await expect(settings.locator('.env-icon path')).toHaveCount(1);
    await expect(drawer.locator('[aria-current]')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('a count shows on its destination, capped at 999+, and its name says it', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  for (const form of ['drawer', 'rail'] as const) {
    const nav = scope.getByRole('navigation', { name: `Mail ${form}` });
    const inbox = nav.getByRole('button', { name: 'Inbox, 3 new', exact: true });
    await expect(inbox.locator(`.env-${form}-count`)).toHaveText('3');
    await expect(inbox.locator(`.env-${form}-count`)).toHaveAttribute('aria-hidden', 'true');
    const sent = nav.getByRole('button', { name: 'Sent, 999+ new', exact: true });
    await expect(sent.locator(`.env-${form}-count`)).toHaveText('999+');
    // A count of 0 shows nothing, and the label alone names the destination.
    const drafts = nav.getByRole('button', { name: 'Drafts', exact: true });
    await expect(drafts.locator(`.env-${form}-count`)).toHaveCount(0);
  }
});

test('Drawer heads each run of a group, and Rail and Bar keep the order without headings', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const drawer = scope.getByRole('navigation', { name: 'Mail drawer' });
  await expect(drawer.locator('.env-drawer-heading')).toHaveText(['Folders', 'Account']);
  const folders = drawer.getByRole('list', { name: 'Folders' });
  await expect(folders.getByRole('button')).toHaveText(['Starred', 'Archive']);
  await expect(drawer.getByRole('list', { name: 'Account' }).getByRole('button')).toHaveText([
    'Settings',
  ]);
  const order = ['Inbox', 'Drafts', 'Sent', 'Starred', 'Archive', 'Settings'];
  await expect(drawer.locator('.env-drawer-label')).toHaveText(order);
  const rail = scope.getByRole('navigation', { name: 'Mail rail' });
  await expect(rail.locator('.env-rail-label')).toHaveText(order);
  await expect(rail.getByRole('heading')).toHaveCount(0);
  await expect(rail.locator('[class*="heading"]')).toHaveCount(0);
  // The drawer keeps its header and footer, and its list takes the height between.
  const box = (locator: Locator) => locator.evaluate((element) => element.getBoundingClientRect());
  const [nav, footer] = [await box(drawer), await box(drawer.locator('.env-drawer-footer'))];
  expect(Math.abs(nav.bottom - footer.bottom)).toBeLessThan(16);
});

test('Bar shows five destinations at most, and opens the rest from More', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const four = scope.getByRole('navigation', { name: 'Mail bar' });
  await expect(four.getByRole('listitem')).toHaveCount(4);
  // The destinations share the bar's width.
  const widths = await four
    .getByRole('listitem')
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
  for (const width of widths) expect(Math.abs(width - widths[0])).toBeLessThan(1);

  const bar = scope.getByRole('navigation', { name: 'Many bar' });
  await expect(bar.getByRole('listitem')).toHaveCount(5);
  await expect(bar.locator('.env-bar-text')).toHaveText([
    'Home',
    'Inbox',
    'Drafts',
    'Sent',
    'More',
  ]);
  // More holds the current destination and counts what it holds: Labels, 4, and Archive, 1.
  const more = bar.getByRole('button', { name: 'More, 5 new', exact: true });
  await expect(more).toHaveAttribute('data-current', '');
  await expect(more).not.toHaveAttribute('aria-current');
  await more.click();
  const menu = page.getByRole('menu', { name: 'More' });
  await expect(menu.getByRole('menuitem')).toHaveCount(3);
  const labels = menu.getByRole('menuitem', { name: /Labels/ });
  await expect(labels).toHaveAttribute('aria-current', 'page');
  await expect(labels).toHaveAccessibleName('Labels 4 new');
  await expect(menu.getByRole('menuitem', { name: /Archive/ })).toHaveAttribute('href', '#archive');
  await menu.getByRole('menuitem', { name: /Trash/ }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();
});

test(
  'destinations are tab stops in order, and Enter selects one',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=navigation`);
    const rail = page
      .getByTestId('navigation-light')
      .getByRole('navigation', { name: 'Mail rail' });
    const items = rail.locator('.env-rail-item');
    await items.first().focus();
    for (const label of ['Drafts', 'Sent', 'Starred']) {
      await page.keyboard.press('Tab');
      await expect(rail.getByRole('button', { name: new RegExp(`^${label}`) })).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await expect(rail.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByTestId('navigation-light').getByTestId('current')).toHaveText(
      'Starred, Labels',
    );
  },
);

test('a destination with href is a link through the LinkProvider', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const routed = scope.getByRole('navigation', { name: 'Routed' });
  const home = routed.getByRole('link', { name: 'Home' });
  await expect(home).toHaveAttribute('href', '#home');
  await expect(home).toHaveAttribute('data-router-link', '');
  await expect(home).toHaveAttribute('aria-current', 'page');
  // Outside a LinkProvider, a destination is a native anchor.
  const plain = scope
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Inbox' });
  await expect(plain).not.toHaveAttribute('data-router-link');
});

test('Rail is a narrow column, and Drawer items fill its width', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-light');
  const rail = scope.getByRole('navigation', { name: 'Mail rail' });
  const rem = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  expect((await rail.boundingBox())!.width).toBeCloseTo(5 * rem, 0);
  const drawer = scope.getByRole('navigation', { name: 'Mail drawer' });
  const list = (await drawer.locator('.env-drawer-list').boundingBox())!;
  for (const item of await drawer.locator('.env-drawer-item').all())
    expect(Math.abs((await item.boundingBox())!.width - list.width)).toBeLessThan(1);
});
