import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

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
      truncated: [...nav.querySelectorAll('.env-breadcrumb-label')].map(
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
  await expect(navigation.locator('.env-breadcrumb-separator')).toHaveCount(3);
  await expect(navigation.locator('.env-breadcrumb-separator').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await navigation.getByRole('link', { name: 'Workspace' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-breadcrumb-navigated-to', '/workspace');
  await navigation.getByRole('button', { name: 'Plans' }).click();
  await expect(scope.getByTestId('breadcrumb-result-light')).toHaveText('Plans');
  await expect(navigation.getByText('Search')).toHaveCSS('cursor', 'auto');
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

test('keys render as key caps joined by plus', async ({ page }) => {
  await page.goto(dataFixture);
  const scope = page.getByTestId('data-light');
  const combination = scope.locator('kbd.env-kbd-combination');
  await expect(combination).toHaveText('Ctrl+P');
  await expect(combination.locator('kbd.env-kbd')).toHaveCount(2);
  await expect(scope.locator('kbd.env-kbd').filter({ hasText: 'F2' })).toBeVisible();
});

test('tables scroll sideways in a focusable region and keep a sticky header', async ({ page }) => {
  await page.goto(dataFixture);
  for (const theme of ['light', 'dark']) {
    const table = page.getByRole('table', { name: `Plans ${theme}` });
    await expect(table).toBeVisible();
    const region = page.getByRole('region', { name: `Plans ${theme}` });
    await expect(region).toHaveAttribute('tabindex', '0');
    expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
      true,
    );
    await expect(table.getByRole('columnheader', { name: 'Decisions' })).toHaveCSS(
      'text-align',
      'end',
    );
    await expect(table.getByRole('cell', { name: '7', exact: true }).first()).toHaveCSS(
      'font-variant-numeric',
      'tabular-nums',
    );

    const header = table.getByRole('columnheader', { name: 'Plan' });
    await region.evaluate((element) => (element.scrollTop = 400));
    // The caption scrolls away; the header row stays at the top of the region.
    const top = await region.evaluate(
      (element) => element.getBoundingClientRect().top + element.clientTop,
    );
    await expect.poll(async () => (await header.boundingBox())!.y).toBeCloseTo(top, 0);
    // The opaque header covers the rows scrolled beneath it.
    const background = await header.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(background).toContain('gradient');
  }
  const compact = page.getByRole('table', { name: 'Compact light' });
  await expect(compact.getByRole('rowheader', { name: 'Total' })).toBeVisible();
});
