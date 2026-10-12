import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('notices use status and alert roles by tone and dismiss on request', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=notices`);
  const scope = page.getByTestId('notices-light');
  await expect(scope.getByRole('status').filter({ hasText: 'Sync paused' })).toBeVisible();
  await expect(scope.getByRole('status').filter({ hasText: 'published' })).toBeVisible();
  // Warnings and errors present from the start are not live regions.
  await expect(scope.getByRole('alert')).toHaveCount(0);
  const blocked = scope.locator('.env-notice[data-tone="warning"]');
  await expect(blocked).not.toHaveAttribute('role');
  await expect(blocked.getByRole('link', { name: 'Show blockers' })).toBeVisible();
  await expect(blocked.locator('.env-notice-icon svg')).toHaveCount(1);
  await expect(
    scope.locator('.env-notice').filter({ hasText: 'No icon here' }).locator('svg'),
  ).toHaveCount(0);

  await scope.getByRole('button', { name: 'Dismiss' }).click();
  await expect(scope.getByText('Could not load the index')).toHaveCount(0);

  await scope.getByRole('button', { name: 'Fail the save light' }).click();
  await expect(scope.getByRole('alert')).toContainText('Save failed');

  for (const theme of ['light', 'dark']) {
    const notice = page.getByTestId(`notices-${theme}`).locator('.env-notice[data-tone="success"]');
    const colors = await notice.evaluate((element) => ({
      icon: getComputedStyle(element.querySelector('.env-notice-icon')!).color,
      text: getComputedStyle(element).color,
    }));
    expect(colors.icon).not.toBe(colors.text);
  }
});

test('popovers open from their trigger, close on Escape and outside presses, and return focus', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=popover`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`popover-${theme}`);
    const details = scope.getByRole('button', { name: `Details ${theme}` });
    await details.click();
    const dialog = page.getByRole('dialog', { name: 'Document details' });
    await expect(dialog).toBeVisible();
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      theme,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(details).toBeFocused();

    await details.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();

    const rename = scope.getByRole('button', { name: `Rename ${theme}` });
    await rename.click();
    const form = page.getByRole('dialog', { name: `Rename ${theme}` });
    await expect(form).toBeVisible();
    expect((await form.boundingBox())!.width).toBeGreaterThan(400);
    await form.getByRole('textbox', { name: 'Name' }).fill('Plan.md');
    await form.getByRole('button', { name: 'Save name' }).click();
    await expect(form).toBeHidden();
    await expect(page.getByTestId(`popover-result-${theme}`)).toHaveText('Renamed');
  }
});

test('dialogs open wide for heavy content and near the top for search-like tasks', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  await page.getByRole('button', { name: 'Open wide dialog' }).click();
  const wide = page.getByRole('dialog', { name: 'Wide details' });
  await expect(wide).toBeVisible();
  await expect.poll(async () => (await wide.boundingBox())!.width).toBeCloseTo(44 * 16, 0);
  await page.keyboard.press('Escape');
  await expect(wide).toBeHidden();

  await page.getByRole('button', { name: 'Open top dialog' }).click();
  const top = page.getByRole('dialog', { name: 'Search plans' });
  await expect(top).toBeVisible();
  await expect(top.getByRole('button', { name: 'Close' })).toBeVisible();
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => (await top.boundingBox())!.y)
    .toBeLessThan(Math.min(viewport.height * 0.12, 96) + 8);
  await expect.poll(async () => (await top.boundingBox())!.width).toBeCloseTo(28 * 16, 0);
});

test('a notice dismiss button is a circle tinted with the notice tone', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=notices`);
  const notice = page
    .getByTestId('notices-light')
    .locator('.env-notice')
    .filter({ has: page.getByRole('button', { name: 'Dismiss' }) });
  const dismiss = notice.getByRole('button', { name: 'Dismiss' });
  const box = (await dismiss.boundingBox())!;
  expect(Math.abs(box.width - box.height)).toBeLessThan(0.5);
  await expect(dismiss).toHaveCSS('border-top-left-radius', '50%');
  const tone = await notice.evaluate(
    (element) => getComputedStyle(element.querySelector('.env-notice-icon')!).color,
  );
  await expect(dismiss).toHaveCSS('color', tone);
  await dismiss.hover();
  await expect(dismiss).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(dismiss).toHaveCSS('color', tone);
});

test('dialogs, the command palette and popovers share one raised surface', async ({ page }) => {
  const surface = (locator: import('@playwright/test').Locator) =>
    locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
        radius: style.borderTopLeftRadius,
      };
    });
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  await page.getByRole('button', { name: 'Open wide dialog' }).click();
  const dialog = await surface(page.getByRole('dialog', { name: 'Wide details' }));
  expect(dialog.border).not.toMatch(/^0px/);

  await page.goto(`${fixtureUrl}/?fixture=popover`);
  await page.getByRole('button', { name: 'Details light' }).click();
  expect(await surface(page.getByRole('dialog', { name: 'Document details' }))).toEqual(dialog);

  await page.goto(`${fixtureUrl}/?fixture=palette`);
  await page.getByRole('button', { name: 'Quick open light' }).focus();
  await page.keyboard.press('Enter');
  expect(await surface(page.getByRole('dialog', { name: 'Go to document' }))).toEqual(dialog);
});
