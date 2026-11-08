import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

// What NavigationBar, NavigationRail and NavigationDrawer share, over the same destinations in
// tests/fixture/Navigation.fixture.tsx.

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
  await expect(scope.locator('nav.env-navigation-drawer[aria-label="Mail drawer"]')).toHaveCount(1);
  await expect(scope.locator('nav.env-navigation-rail[aria-label="Mail rail"]')).toHaveCount(1);
  await expect(scope.locator('nav.env-navigation-bar[aria-label="Mail bar"]')).toHaveCount(1);
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
    await expect(inbox.locator(`.env-navigation-${form}-count`)).toHaveText('3');
    await expect(inbox.locator(`.env-navigation-${form}-count`)).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    // Its text is the label, then the count, apart, in the order its name gives them; the rail
    // draws its indicator, with the count, above the label all the same.
    expect(await inbox.evaluate((element) => element.textContent)).toBe('Inbox 3');
    if (form === 'rail') {
      const indicator = (await inbox.locator('.env-navigation-rail-indicator').boundingBox())!;
      const label = (await inbox.locator('.env-navigation-rail-label').boundingBox())!;
      expect(indicator.y + indicator.height).toBeLessThanOrEqual(label.y + 0.5);
    }
    const sent = nav.getByRole('button', { name: 'Sent, 999+ new', exact: true });
    await expect(sent.locator(`.env-navigation-${form}-count`)).toHaveText('999+');
    // A count of 0 shows nothing, and the label alone names the destination.
    const drafts = nav.getByRole('button', { name: 'Drafts', exact: true });
    await expect(drafts.locator(`.env-navigation-${form}-count`)).toHaveCount(0);
  }
});

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

test('the forms and the top bar fill a plain rectangle with one background, or each the page’s on its own', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`navigation-${theme}`).getByTestId('backgrounds');
    // A token's color in the theme, read from a probe painted with it.
    const token = (name: string) =>
      scope.evaluate((element, name) => {
        const probe = document.createElement('div');
        probe.style.background = `var(${name})`;
        element.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      }, name);
    const pane = await token('--env-color-bg-default');
    const pageColor = await token('--env-color-bg-page');
    expect(pane).not.toBe(pageColor);
    const look = (locator: Locator) =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          radius: style.borderTopLeftRadius,
          lines: [style.borderTopWidth, style.borderBottomWidth, style.borderInlineEndWidth],
        };
      });
    const filled = [
      scope.getByTestId('top-bar-default'),
      scope.getByRole('navigation', { name: 'Filled drawer' }),
      scope.getByRole('navigation', { name: 'Filled rail' }),
      scope.getByRole('navigation', { name: 'Filled bar' }),
    ];
    const plain = [
      scope.getByTestId('top-bar-none'),
      scope.getByRole('navigation', { name: 'Plain drawer' }),
      scope.getByRole('navigation', { name: 'Plain rail' }),
      scope.getByRole('navigation', { name: 'Plain bar' }),
    ];
    // By default the navigation's background, square, with no line.
    for (const element of filled)
      expect(await look(element)).toEqual({
        background: pane,
        radius: '0px',
        lines: ['0px', '0px', '0px'],
      });
    // background="page": the page's background.
    for (const element of plain) {
      await expect(element).toHaveAttribute('data-background', 'page');
      expect((await look(element)).background).toBe(pageColor);
    }
    // On a surface, the surface's color rather than a second fill.
    const surface = await scope
      .getByTestId('surface')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(
      (await look(scope.getByRole('navigation', { name: 'Drawer on a surface' }))).background,
    ).toBe(surface);
  }
});
