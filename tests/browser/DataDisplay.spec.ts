import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const dataFixture = `${fixtureUrl}/?fixture=data-display`;

/**
 * Waits two frames, so a state change has started its transitions, and then until the element's
 * own transitions have finished: what it shows then is where it settles.
 */
async function settled(element: Locator) {
  await element.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await expect
    .poll(() =>
      element.evaluate(
        (node) =>
          node.getAnimations().filter((animation) => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
}

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
  // A level that fits shows no tooltip.
  await trail.getByRole('link', { name: 'Workspace' }).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(trail.getByRole('link', { name: 'Workspace' })).toBeFocused();
  await expect(tooltip).toHaveCount(0);
  // The link's name is its whole label; the tooltip shows it as keyboard focus reaches it.
  await page.keyboard.press('Tab');
  await expect(trail.getByRole('link', { name: long })).toBeFocused();
  await expect(tooltip).toHaveText(long);
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  // The current page of a one-line trail, cut short first, shows it on hover.
  await scope
    .getByRole('navigation', { name: 'One-line trail' })
    .locator('[aria-current="page"]')
    .hover();
  await expect(tooltip).toHaveText('Quarterly review of the shared design tokens');
});

test('keys render as key caps joined by plus', async ({ page }) => {
  await page.goto(dataFixture);
  const scope = page.getByTestId('data-light');
  const combination = scope.locator('kbd.env-kbd-combination');
  await expect(combination).toHaveText('Ctrl+P');
  await expect(combination.locator('kbd.env-kbd')).toHaveCount(2);
  await expect(scope.locator('kbd.env-kbd').filter({ hasText: 'F2' })).toBeVisible();
});

test('interactive rows react to hover, presses and focus, and open from anywhere', async ({
  page,
}) => {
  // With motion, as pressed controls shrink: a press on the row still follows its link.
  await page.goto(dataFixture);
  for (const theme of ['light', 'dark']) {
    const rows = page.getByRole('list', { name: `Rows ${theme}` }).getByRole('listitem');
    const [open, plain] = [rows.first(), rows.last()];
    const link = open.getByRole('link', { name: 'Roadmap' });
    const action = open.getByRole('button', { name: 'More actions' });
    const fill = (row: typeof open) =>
      row.evaluate((element) => getComputedStyle(element).backgroundColor);
    const rest = await fill(open);
    expect(await fill(plain)).toBe(rest);
    await expect(open).toHaveCSS('position', 'relative');
    await plain.hover();
    await settled(plain);
    expect(await fill(plain)).toBe(rest);
    // The row reacts to the pointer anywhere on it, and to keyboard focus inside it.
    await open.hover({ position: { x: 8, y: 8 } });
    await expect.poll(() => fill(open)).not.toBe(rest);
    await settled(open);
    const hovered = await fill(open);
    await page.mouse.move(0, 0);
    await expect.poll(() => fill(open)).toBe(rest);
    // Keyboard focus inside the row highlights it (the action: WebKit's Tab skips links).
    await link.focus();
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    await expect.poll(() => fill(open)).toBe(hovered);
    await action.blur();
    await expect.poll(() => fill(open)).toBe(rest);
    // A press beside the title follows the link that covers the row, and the row shows it.
    const box = (await open.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 6);
    await page.mouse.down();
    await settled(open);
    const pressed = await fill(open);
    expect(pressed).not.toBe(hovered);
    await page.mouse.up();
    await expect(page.getByTestId(`row-result-${theme}`)).toHaveText('open roadmap');
    // The action keeps its own press: the row does not darken, and stays plain once the pointer
    // leaves, though a click may leave focus on the action.
    const actionBox = (await action.boundingBox())!;
    await page.mouse.move(actionBox.x + actionBox.width / 2, actionBox.y + actionBox.height / 2);
    await page.mouse.down();
    await settled(open);
    expect(await fill(open)).toBe(hovered);
    await page.mouse.up();
    await expect(page.getByTestId(`row-result-${theme}`)).toHaveText('more actions');
    await page.mouse.move(0, 0);
    await expect.poll(() => fill(open)).toBe(rest);
    // The covering link is not dragged as a link where the engine supports it.
    const drag = await link.evaluate(
      (element) =>
        (getComputedStyle(element) as CSSStyleDeclaration & { webkitUserDrag?: string })
          .webkitUserDrag,
    );
    if (drag !== undefined) expect(drag).toBe('none');
    await expect(link).toHaveAttribute('draggable', 'false');
  }
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

test('wheeling over a table with a sticky header scrolls the page when the table cannot scroll further', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 500 });
  await page.goto(dataFixture);
  const region = page.getByRole('region', { name: 'Plans light' });
  const pageTop = () => page.evaluate(() => document.scrollingElement!.scrollTop);
  const wheelOver = async (deltaY: number) => {
    const box = (await region.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, Math.min(Math.max(box.y, 0) + 40, 460));
    const before = await pageTop();
    await page.mouse.wheel(0, deltaY);
    await expect.poll(async () => Math.sign((await pageTop()) - before)).toBe(Math.sign(deltaY));
  };
  // At its start, the region hands an upward wheel on to the page.
  await region.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await region.evaluate((element) => (element.scrollTop = 0));
  await wheelOver(-150);
  // Without a height, the region has nothing to scroll: the wheel moves the page at once.
  await region.evaluate((element) => (element.style.maxBlockSize = 'none'));
  expect(await region.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
    false,
  );
  await region.scrollIntoViewIfNeeded();
  await wheelOver(300);
});
