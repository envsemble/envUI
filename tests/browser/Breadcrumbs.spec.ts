import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const dataFixture = `${fixtureUrl}/?fixture=data-display`;

/** How a breadcrumb trail is laid out: its height in lines, which labels are cut short, and what
 * extends past the navigation's box or clips the crumbs. */
function trailLayout(navigation: Locator) {
  return navigation.evaluate((nav) => {
    const list = nav.querySelector('.env-breadcrumbs-list')!;
    const items = [...list.children];
    const box = nav.getBoundingClientRect();
    return {
      direction: getComputedStyle(nav).direction,
      lines:
        list.getBoundingClientRect().height /
        Math.max(...items.map((item) => item.getBoundingClientRect().height)),
      truncated: [...nav.querySelectorAll('.env-breadcrumbs-label')].map(
        (label) => label.scrollWidth > label.clientWidth,
      ),
      outside: [...nav.querySelectorAll('*')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < box.left - 0.5 || rect.right > box.right + 0.5;
        })
        .map((element) => element.getAttribute('class')),
      clipping: [nav, list, ...items]
        .filter((element) => getComputedStyle(element).overflowX !== 'visible')
        .map((element) => element.getAttribute('class')),
    };
  });
}

test('breadcrumbs link earlier levels and mark the current page', async ({ page }) => {
  await page.goto(dataFixture);
  const scope = page.getByTestId('data-light');
  const navigation = scope.getByRole('navigation', { name: 'Breadcrumb' });
  const items = navigation.getByRole('listitem');
  await expect(items).toHaveCount(4);
  await expect(navigation.locator('[aria-current="page"]')).toHaveText('Roadmap.md');
  await expect(navigation.getByRole('link', { name: 'Roadmap.md' })).toHaveCount(0);
  // Separators are decorative.
  await expect(navigation.locator('.env-breadcrumbs-separator')).toHaveCount(3);
  await expect(navigation.locator('.env-breadcrumbs-separator').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await navigation.getByRole('link', { name: 'Workspace' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-breadcrumb-navigated-to', '/workspace');
  await navigation.getByRole('button', { name: 'Plans' }).click();
  await expect(scope.getByTestId('breadcrumb-result-light')).toHaveText('Plans');
  await expect(navigation.getByText('Search')).toHaveCSS('cursor', 'auto');
});

test('a focused breadcrumb label that comes to fit keeps focus until it loses it', async ({
  page,
}) => {
  await page.goto(dataFixture);
  const bar = page.getByTestId('breadcrumb-bar-light');
  const current = bar.locator('[aria-current="page"]');
  await expect(current).toHaveAttribute('tabindex', '0');
  await current.focus();
  // The bar widens, as with the window, until the label fits.
  await bar.evaluate((element) => (element.style.inlineSize = '60rem'));
  await expect
    .poll(() =>
      current
        .locator('.env-breadcrumbs-label')
        .evaluate((label) => label.scrollWidth > label.clientWidth),
    )
    .toBe(false);
  // The browser moves focus off an element that can no longer take it at its next rendering
  // update, so the check waits past two frames.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await expect(current).toBeFocused();
  await expect(current).toHaveAttribute('tabindex', '0');
  // Once focus moves on, the label leaves the tab order.
  await bar.getByRole('button', { name: 'More actions' }).focus();
  await expect(current).not.toHaveAttribute('tabindex');
});

test('a narrow breadcrumb trail wraps by default', async ({ page }) => {
  await page.goto(dataFixture);
  for (const theme of ['light', 'dark']) {
    const navigation = page
      .getByTestId(`data-${theme}`)
      .getByRole('navigation', { name: 'Wrapping trail' });
    await expect(navigation).not.toHaveAttribute('data-nowrap');
    const layout = await trailLayout(navigation);
    expect(layout.lines).toBeGreaterThan(1.5);
    expect(layout.outside).toEqual([]);
  }
});

test('a breadcrumb trail without wrap stays on one line and cuts the current page short first', async ({
  page,
}) => {
  await page.goto(dataFixture);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`data-${theme}`);
    for (const [name, direction, truncated] of [
      ['One-line trail', 'ltr', [false, false, true]],
      ['Right-to-left trail', 'rtl', [false, false, true]],
      ['Header trail', 'ltr', [false, true]],
    ] as const) {
      const layout = await trailLayout(scope.getByRole('navigation', { name }));
      expect(layout.direction, name).toBe(direction);
      expect(layout.lines, name).toBeCloseTo(1, 1);
      // Only the current page is cut short; earlier levels keep their width.
      expect(layout.truncated, name).toEqual(truncated);
      expect(layout.outside, name).toEqual([]);
      // Nothing clips the crumbs, so their focus outlines stay whole.
      expect(layout.clipping, name).toEqual([]);
    }
    // In a compact header bar as wide as a phone, the trail ends before the status and the action.
    const bar = scope.getByTestId(`breadcrumb-bar-${theme}`);
    const trail = (await bar.getByRole('navigation', { name: 'Header trail' }).boundingBox())!;
    const status = (await bar.locator('.env-badge').boundingBox())!;
    const action = (await bar.getByRole('button', { name: 'More actions' }).boundingBox())!;
    expect(trail.x + trail.width).toBeLessThanOrEqual(status.x);
    expect(status.x + status.width).toBeLessThanOrEqual(action.x);
  }
});

test('a breadcrumb cut short shows its full label in a tooltip, on hover and keyboard focus', async ({
  page,
}) => {
  await page.goto(dataFixture);
  const scope = page.getByTestId('data-light');
  const tooltip = page.locator('.env-tooltip');
  const long = 'A folder whose name runs well past the room that one level of a trail takes';
  const trail = scope.getByRole('navigation', { name: 'Long level trail' });
  // Keyboard focus, which WebKit gives links only through focus(): a key press first makes the
  // focus that follows keyboard focus (:focus-visible) in every engine.
  const keyboardFocus = async (name: string) => {
    await page.keyboard.press('Shift');
    await trail.getByRole('link', { name }).focus();
    await expect(trail.getByRole('link', { name })).toBeFocused();
  };
  // A level that fits shows no tooltip.
  await keyboardFocus('Workspace');
  await expect(tooltip).toHaveCount(0);
  // The link's name is its whole label; the tooltip shows it as keyboard focus reaches it.
  await keyboardFocus(long);
  await expect(tooltip).toHaveText(long);
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  // The current page of a one-line trail, cut short first, shows it on hover.
  const oneLine = scope.getByRole('navigation', { name: 'One-line trail' });
  const current = oneLine.locator('[aria-current="page"]');
  await current.hover();
  await expect(tooltip).toHaveText('Quarterly review of the shared design tokens');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
  // Cut short, it is a tab stop after the links, and keyboard focus shows it in full too.
  await expect(current).toHaveAttribute('tabindex', '0');
  await oneLine.getByRole('link').last().focus();
  await page.keyboard.press('Tab');
  await expect(current).toBeFocused();
  await expect(tooltip).toHaveText('Quarterly review of the shared design tokens');
  await page.keyboard.press('Escape');
  // A current page that fits takes no focus.
  await expect(trail.locator('[aria-current="page"]')).not.toHaveAttribute('tabindex', /.*/);
});
