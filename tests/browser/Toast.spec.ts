import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('http://127.0.0.1:8766/?fixture=toast');
});
const region = (page: import('@playwright/test').Page, placement = 'bottom-right') =>
  page.locator(`.env-toast-viewport-${placement}`);
const notice = (
  page: import('@playwright/test').Page,
  message: string,
  placement = 'bottom-right',
) =>
  region(page, placement)
    .locator('.env-toast')
    .filter({ has: page.locator('.env-toast-message', { hasText: message }) });

test('newest notices stay visible and older notices return independently per placement', async ({
  page,
}) => {
  await page.getByTestId('toast-queue-bottom').click();
  await page.getByTestId('toast-queue-top').click();
  await expect(region(page).locator('.env-toast:not([data-limited])')).toHaveCount(3);
  await expect(region(page, 'top-center').locator('.env-toast:not([data-limited])')).toHaveCount(3);
  await expect(notice(page, 'Bottom queue 1')).toBeHidden();
  await notice(page, 'Bottom queue 4')
    .getByRole('button', { name: 'Dismiss notification' })
    .click();
  await expect(notice(page, 'Bottom queue 4')).toHaveCount(0);
  for (const index of [1, 2, 3]) await expect(notice(page, `Bottom queue ${index}`)).toBeVisible();
  await expect(region(page, 'top-center').locator('.env-toast:not([data-limited])')).toHaveCount(3);
  await notice(page, 'Top queue 4', 'top-center')
    .getByRole('button', { name: 'Dismiss notification' })
    .click();
  await expect(notice(page, 'Top queue 4', 'top-center')).toHaveCount(0);
  for (const index of [1, 2, 3])
    await expect(notice(page, `Top queue ${index}`, 'top-center')).toBeVisible();
  await page.getByTestId('toast-clear').click();
  await expect(page.locator('.env-toast-viewport .env-toast')).toHaveCount(0);
});

test('manual rendering works without a provider and errors/actions persist', async ({ page }) => {
  await page.getByTestId('manual-toast').getByRole('button', { name: 'Manual action' }).click();
  await expect(page.getByTestId('manual-action-count')).toHaveText('1');
  await page
    .getByTestId('manual-toast')
    .getByRole('button', { name: 'Dismiss manual notice' })
    .click();
  await expect(page.getByTestId('manual-toast')).toHaveCount(0);
  await page.getByTestId('toast-error').click();
  await page.getByTestId('toast-action').click();
  await page.clock.fastForward(6_000);
  await expect(notice(page, 'Persistent error notice')).toHaveCount(1);
  await expect(notice(page, 'Persistent action notice')).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(1);
  await notice(page, 'Persistent action notice')
    .getByRole('button', { name: 'Undo notice' })
    .click();
  await expect(page.getByTestId('toast-action-count')).toHaveText('1');
});

test('visible timers pause for focus and hover together and resume after both leave', async ({
  page,
}) => {
  await page.getByTestId('toast-short').click();
  const toast = notice(page, 'Short notice');
  const close = toast.getByRole('button', { name: 'Dismiss notification' });
  // Timer pauses follow keyboard-visible focus; establish keyboard interaction first.
  await page.keyboard.press('Tab');
  await close.focus();
  await toast.hover();
  await page.mouse.move(1, 1);
  await page.clock.fastForward(800);
  await expect(toast).toHaveCount(1);
  await expect(close).toBeFocused();
  await page.getByTestId('toast-clear').focus();
  await page.clock.fastForward(500);
  await expect(toast).toHaveCount(0);
});

test('ordinary notices expire after the default five seconds', async ({ page }) => {
  await page.getByTestId('toast-neutral').click();
  await expect(notice(page, 'Neutral notice')).toHaveCount(1);
  await page.mouse.move(1, 1);
  await page.clock.fastForward(4_000);
  await expect(notice(page, 'Neutral notice')).toHaveCount(1);
  await page.clock.fastForward(1_100);
  await expect(notice(page, 'Neutral notice')).toHaveCount(0);
});

test('viewport focus pauses existing and newly displayed timers', async ({ page }) => {
  await page.getByTestId('toast-short').click();
  await page.keyboard.press('F6');
  await expect(region(page)).toBeFocused();
  await page.clock.fastForward(800);
  await expect(notice(page, 'Short notice')).toHaveCount(1);
  await page.getByTestId('toast-short').dispatchEvent('click');
  await page.clock.fastForward(800);
  await expect(notice(page, 'Short notice')).toHaveCount(2);
  await page.getByTestId('toast-clear').focus();
  await page.clock.fastForward(500);
  await expect(notice(page, 'Short notice')).toHaveCount(0);
});

test('Strict Mode mount effects preserve capacity after effect replay', async ({ page }) => {
  await page.getByRole('button', { name: 'Mount strict toast provider' }).click();
  const active = page.locator(
    '.env-toast-viewport-bottom-right .env-toast:not([data-ending-style]):not([data-limited])',
  );
  await expect(active).toHaveCount(1);
  await page.getByRole('button', { name: 'Add strict notices' }).click();
  await expect(active).toHaveCount(3);
  await page.clock.fastForward(350);
  await expect(active).toHaveCount(3);
});

test('placement stacks, keyboard access, wrapped sizing and contextual action states', async ({
  page,
}) => {
  await page.getByTestId('toast-queue-bottom').click();
  const boxes = await region(page)
    .locator('.env-toast:not([data-limited])')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().y));
  expect(boxes[0]).toBeGreaterThan(boxes[1]);
  expect(boxes[1]).toBeGreaterThan(boxes[2]);
  await page.keyboard.press('F6');
  await expect(region(page)).toBeFocused();
  await page.getByTestId('toast-clear').click();
  await expect(region(page).locator('.env-toast')).toHaveCount(0);
  await page.getByTestId('toast-action').click();
  const toast = notice(page, 'Persistent action notice');
  const button = toast.getByRole('button', { name: 'Undo notice' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const base = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  await button.hover();
  const hover = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  await button.dispatchEvent('pointerdown');
  expect(hover).not.toBe(base);
  await page.setViewportSize({ width: 390, height: 800 });
  const geometry = await toast.evaluate((element) => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
    height: element.getBoundingClientRect().height,
    whiteSpace: getComputedStyle(element.querySelector('.env-toast-message')!).whiteSpace,
  }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
  expect(geometry.whiteSpace).toBe('normal');
  expect(geometry.height).toBeLessThan(75);
  await page.getByTestId('toast-clear').click();
  await page.getByTestId('toast-queue-actions').click();
  await page.setViewportSize({ width: 320, height: 160 });
  // Cleared toasts finish their exit transition before the stack is measured.
  await expect(region(page).locator('.env-toast[data-ending-style]')).toHaveCount(0);
  const stack = await region(page).evaluate((viewport) => ({
    scroll: viewport.scrollHeight,
    height: viewport.clientHeight,
    rows: Array.from(viewport.querySelectorAll('.env-toast'))
      .map((element) => {
        const row = element.getBoundingClientRect();
        const action = element.querySelector('.env-toast-action')!.getBoundingClientRect();
        return {
          top: row.top,
          bottom: row.bottom,
          actionTop: action.top,
          actionBottom: action.bottom,
        };
      })
      .sort((a, b) => a.top - b.top),
  }));
  expect(stack.scroll).toBeGreaterThan(stack.height);
  expect(stack.rows).toHaveLength(3);
  stack.rows.forEach((row, index) => {
    expect(row.actionTop).toBeGreaterThanOrEqual(row.top);
    expect(row.actionBottom).toBeLessThanOrEqual(row.bottom);
    if (index) expect(row.top).toBeGreaterThanOrEqual(stack.rows[index - 1].bottom);
  });
});
