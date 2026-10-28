import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const fixture = `${fixtureUrl}/?fixture=paginations`;

/** The range text and whether each button can be pressed. */
async function state(pager: Locator) {
  const available = async (name: string) =>
    (await pager.getByRole('button', { name, exact: true }).getAttribute('aria-disabled')) !==
    'true';
  return {
    range: await pager.locator('.env-pagination-range').textContent(),
    previous: await available('Previous page'),
    next: await available('Next page'),
  };
}

test('the range and the buttons follow the page, and a loading page makes both wait', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = scope.getByRole('navigation', { name: 'Report pages light' });
  const previous = pager.getByRole('button', { name: 'Previous page' });
  const next = pager.getByRole('button', { name: 'Next page' });
  const finish = scope.getByRole('button', { name: 'Finish loading light' });
  await expect(pager.locator('.env-pagination-range')).toHaveText('1–60 of 245');
  expect(await state(pager)).toEqual({ range: '1–60 of 245', previous: false, next: true });
  // Nothing comes before the first page; the button is unavailable, yet a press reaches it.
  await previous.click({ force: true });
  await expect(scope.getByTestId('changes')).toHaveText('');

  await next.click();
  await expect(scope.getByTestId('changes')).toHaveText('2');
  // While the page loads, the button pressed shows a spinner and neither takes another press.
  await expect(next).toHaveAttribute('aria-busy', 'true');
  await expect(next.locator('.env-spinner')).toBeVisible();
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await next.click({ force: true });
  await previous.click({ force: true });
  await expect(scope.getByTestId('changes')).toHaveText('2');
  await finish.click();
  await expect(pager.locator('.env-pagination-range')).toHaveText('61–120 of 245');
  await expect(next).not.toHaveAttribute('aria-busy');
  expect(await state(pager)).toEqual({ range: '61–120 of 245', previous: true, next: true });
  // A load that ends forgets its button: the next load from previous spins on previous.
  await previous.click();
  await expect(previous).toHaveAttribute('aria-busy', 'true');
  await expect(next).not.toHaveAttribute('aria-busy');
  await finish.click();
  await expect(pager.locator('.env-pagination-range')).toHaveText('1–60 of 245');
  await expect(scope.getByTestId('changes')).toHaveText('2,1');
});

test('a load for another reason makes both buttons wait without a spinner', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = scope.getByRole('navigation', { name: 'Batches light' });
  const next = pager.getByRole('button', { name: 'Next page' });
  const refresh = scope.getByRole('button', { name: 'Refresh batches light' });
  // These batches page without loading, so the press is forgotten at once.
  await next.click();
  await expect(pager.locator('.env-pagination-range')).toHaveText('51–100');
  await refresh.click();
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(pager.getByRole('button', { name: 'Previous page' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(pager.locator('[aria-busy]')).toHaveCount(0);
  await expect(pager.locator('.env-spinner')).toHaveCount(0);
  await refresh.click();
  expect(await state(pager)).toEqual({ range: '51–100', previous: true, next: true });
});

test('the keyboard pages with Enter and Space, and focus stays on the last page', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = scope.getByRole('navigation', { name: 'Report pages light' });
  const range = pager.locator('.env-pagination-range');
  const next = pager.getByRole('button', { name: 'Next page' });
  const finish = scope.getByRole('button', { name: 'Finish loading light' });
  // The range is announced politely as it changes.
  await expect(range).toHaveAttribute('aria-live', 'polite');
  await pager.getByRole('button', { name: 'Previous page' }).focus();
  // The first page leaves previous unavailable but focusable.
  await expect(pager.getByRole('button', { name: 'Previous page' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await expect(next).toHaveCSS('outline-style', 'solid');
  for (const [key, expected] of [
    ['Enter', '61–120 of 245'],
    ['Space', '121–180 of 245'],
    ['Enter', '181–240 of 245'],
    ['Space', '241–245 of 245'],
  ] as const) {
    await page.keyboard.press(key);
    await expect(next).toHaveAttribute('aria-busy', 'true');
    await expect(next).toBeFocused();
    await finish.evaluate((button: HTMLButtonElement) => button.click());
    await expect(range).toHaveText(expected);
    await expect(next).toBeFocused();
  }
  // On the last page next is unavailable, and focus stays on it.
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await expect(next).not.toHaveAttribute('aria-busy');
  await expect(next).toBeFocused();
  await expect(scope.getByTestId('changes')).toHaveText('2,3,4,5');
});

test('ranges without a total, single pages, empty lists and other languages', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = (name: string) => scope.getByRole('navigation', { name, exact: true });
  await expect(pager('Batches light')).toBeVisible();
  // Without a total, the range shows the page's items and hasNextPage ends the list.
  expect(await state(pager('Batches light'))).toEqual({
    range: '1–50',
    previous: false,
    next: true,
  });
  await pager('Batches light').getByRole('button', { name: 'Next page' }).click();
  await pager('Batches light').getByRole('button', { name: 'Next page' }).click();
  expect(await state(pager('Batches light'))).toEqual({
    range: '101–150',
    previous: true,
    next: false,
  });
  // A list that fits on one page can hide the pager; a later page of an open list keeps it.
  await expect(pager('Hidden single page')).toHaveCount(0);
  expect(await state(pager('Single page'))).toEqual({
    range: '1–40 of 40',
    previous: false,
    next: false,
  });
  expect(await state(pager('Last batch'))).toEqual({
    range: '101–150',
    previous: true,
    next: false,
  });
  await expect(pager('No items').locator('.env-pagination-range')).toHaveText('0 of 0');
  await expect(pager('Last item').locator('.env-pagination-range')).toHaveText('241 of 241');
  // A page beyond the end shows the last page.
  expect(await state(pager('Beyond the end'))).toEqual({
    range: '241–245 of 245',
    previous: true,
    next: false,
  });
  const german = pager('Seiten');
  await expect(german.locator('.env-pagination-range')).toHaveText('21–40 von 1.234');
  await expect(german.getByRole('button')).toHaveText(['', '']);
  expect(
    await german
      .getByRole('button')
      .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label'))),
  ).toEqual(['Vorherige Seite', 'Nächste Seite']);
  await expect(pager('Pagination')).toBeVisible();
});

test('the pager fits small toolbars, wraps only when it must and mirrors right to left', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = (name: string) => scope.getByRole('navigation', { name, exact: true });
  const height = async (name: string) =>
    (await pager(name).getByRole('button', { name: 'Next page' }).boundingBox())!.height;
  await expect(pager('Toolbar pages')).toBeVisible();
  expect(await height('Toolbar pages')).toBeCloseTo(32, 0);
  expect(await height('Compact pages')).toBeCloseTo(32, 0);
  expect(await height('Standard pages')).toBeCloseTo(40, 0);
  // In a toolbar as wide as a phone, the field beside it shrinks and the pager stays on one line.
  const toolbar = pager('Toolbar pages');
  const rows = await toolbar
    .locator(':scope > *')
    .evaluateAll(
      (items) =>
        new Set(
          items.map((item) =>
            Math.round(item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2),
          ),
        ).size,
    );
  expect(rows).toBe(1);
  const field = (await scope.getByRole('searchbox', { name: 'Search reports' }).boundingBox())!;
  const box = (await toolbar.boundingBox())!;
  expect(field.x + field.width).toBeLessThanOrEqual(box.x + 1);

  // A frame too narrow for the pager wraps the buttons below the range, inside the frame.
  const narrow = scope.getByTestId('narrow');
  const narrowPager = pager('Narrow pages');
  await expect(narrowPager.locator('.env-pagination-range')).toHaveText('101–200 of 12,345');
  const frame = (await narrow.boundingBox())!;
  const range = (await narrowPager.locator('.env-pagination-range').boundingBox())!;
  const next = (await narrowPager.getByRole('button', { name: 'Next page' }).boundingBox())!;
  expect(next.y).toBeGreaterThanOrEqual(range.y + range.height - 1);
  expect(next.x + next.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
  expect(await narrow.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

  // Right to left, the pager runs from the right and the chevrons point the way pages run.
  const rtl = pager('Right-to-left pages');
  const previous = (await rtl.getByRole('button', { name: 'Previous page' }).boundingBox())!;
  const following = (await rtl.getByRole('button', { name: 'Next page' }).boundingBox())!;
  const rtlRange = (await rtl.locator('.env-pagination-range').boundingBox())!;
  expect(rtlRange.x).toBeGreaterThan(previous.x);
  expect(previous.x).toBeGreaterThan(following.x);
  await expect(rtl.getByRole('button', { name: 'Next page' }).locator('.env-icon')).toHaveCSS(
    'transform',
    'matrix(-1, 0, 0, 1, 0, 0)',
  );
  await expect(rtl.locator('.env-pagination-range')).toHaveText('11–20 of 30');
});

test('a load the application starts in an effect after the page changes spins the button pressed', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('paginations-light');
  const pager = scope.getByRole('navigation', { name: 'Effect pages light' });
  const previous = pager.getByRole('button', { name: 'Previous page' });
  const next = pager.getByRole('button', { name: 'Next page' });
  const finish = scope.getByRole('button', { name: 'Finish effect loading light' });
  await next.click();
  // The page changes at once and its load starts in the effect that follows.
  await expect(pager.locator('.env-pagination-range')).toHaveText('21–40 of 100');
  await expect(next).toHaveAttribute('aria-busy', 'true');
  await expect(next.locator('.env-spinner')).toBeVisible();
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await expect(previous).not.toHaveAttribute('aria-busy');
  await finish.click();
  await expect(next).not.toHaveAttribute('aria-busy');
  expect(await state(pager)).toEqual({ range: '21–40 of 100', previous: true, next: true });
  // A load for another reason later spins neither button.
  await scope.getByRole('button', { name: 'Reload effect pages light' }).click();
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(pager.locator('[aria-busy]')).toHaveCount(0);
  await finish.click();
  await previous.click();
  await expect(previous).toHaveAttribute('aria-busy', 'true');
  await expect(next).not.toHaveAttribute('aria-busy');
});
