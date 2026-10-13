import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const dataFixture = `${fixtureUrl}/?fixture=data-display`;

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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dataFixture);
  for (const theme of ['light', 'dark']) {
    const rows = page.getByRole('list', { name: `Rows ${theme}` }).getByRole('listitem');
    const [open, plain] = [rows.first(), rows.last()];
    const fill = (row: typeof open) =>
      row.evaluate((element) => getComputedStyle(element).backgroundColor);
    const rest = await fill(open);
    expect(await fill(plain)).toBe(rest);
    await expect(open).toHaveCSS('position', 'relative');
    await plain.hover();
    expect(await fill(plain)).toBe(rest);
    // The row reacts to the pointer anywhere on it, and to focus inside it.
    await open.hover({ position: { x: 8, y: 8 } });
    const hovered = await fill(open);
    expect(hovered).not.toBe(rest);
    await page.mouse.move(0, 0);
    await expect.poll(() => fill(open)).toBe(rest);
    await open.getByRole('link', { name: 'Roadmap' }).focus();
    expect(await fill(open)).toBe(hovered);
    await page.mouse.move(0, 0);
    // A press beside the title follows the stretched link; the action keeps its own press.
    const box = (await open.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6);
    await expect(page.getByTestId(`row-result-${theme}`)).toHaveText('open roadmap');
    await open.getByRole('button', { name: 'More actions' }).click();
    await expect(page.getByTestId(`row-result-${theme}`)).toHaveText('more actions');
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
