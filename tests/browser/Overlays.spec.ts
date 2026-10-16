import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('notices use status and alert roles by tone and dismiss on request', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=alerts`);
  const scope = page.getByTestId('alerts-light');
  await expect(scope.getByRole('status').filter({ hasText: 'Sync paused' })).toBeVisible();
  await expect(scope.getByRole('status').filter({ hasText: 'published' })).toBeVisible();
  // Warnings and errors present from the start are not live regions.
  await expect(scope.getByRole('alert')).toHaveCount(0);
  const blocked = scope.locator('.env-alert[data-tone="warning"]');
  await expect(blocked).not.toHaveAttribute('role');
  await expect(blocked.getByRole('link', { name: 'Show blockers' })).toBeVisible();
  await expect(blocked.locator('.env-alert-icon svg')).toHaveCount(1);
  await expect(
    scope.locator('.env-alert').filter({ hasText: 'No icon here' }).locator('svg'),
  ).toHaveCount(0);

  await scope.getByRole('button', { name: 'Dismiss' }).click();
  await expect(scope.getByText('Could not load the index')).toHaveCount(0);

  await scope.getByRole('button', { name: 'Fail the save light' }).click();
  await expect(scope.getByRole('alert')).toContainText('Save failed');

  for (const theme of ['light', 'dark']) {
    const notice = page.getByTestId(`alerts-${theme}`).locator('.env-alert[data-tone="success"]');
    const colors = await notice.evaluate((element) => ({
      icon: getComputedStyle(element.querySelector('.env-alert-icon')!).color,
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

test('right panels keep their width beside the page and fill a narrow window', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  const open = async (trigger: string, title: string) => {
    await page.getByRole('button', { name: trigger }).click();
    const panel = page.getByRole('dialog', { name: title });
    await expect(panel).toBeVisible();
    return panel;
  };
  const close = async () => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  };
  const width = async (panel: import('@playwright/test').Locator) =>
    (await panel.boundingBox())!.width;
  for (const [viewport, standard, wide] of [
    [1440, 24 * 16, 44 * 16],
    [600, 24 * 16, 600],
    [390, 390, 390],
  ] as const) {
    await page.setViewportSize({ width: viewport, height: 800 });
    const panel = await open('Open panel', 'Report details');
    await expect.poll(() => width(panel)).toBeCloseTo(standard, 0);
    // Once it has slid in, the panel ends at the window's edge.
    await expect
      .poll(async () => {
        const box = (await panel.boundingBox())!;
        return box.x + box.width;
      })
      .toBeCloseTo(viewport, 0);
    await close();
    const widePanel = await open('Open wide panel', 'Wide report details');
    await expect.poll(() => width(widePanel)).toBeCloseTo(wide, 0);
    await close();
  }
  // Across the whole width, the panel needs no border at its start.
  const phonePanel = await open('Open panel', 'Report details');
  await expect(phonePanel).toHaveCSS('border-left-width', '0px');
});

test('a panel across the whole width keeps clear of the safe areas on both sides', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Only one engine emulates safe-area insets.');
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setSafeAreaInsetsOverride', {
    insets: { top: 0, left: 44, bottom: 21, right: 44 },
  });
  for (const [viewport, trigger, title] of [
    [390, 'Open panel', 'Report details'],
    [600, 'Open wide panel', 'Wide report details'],
  ] as const) {
    await page.setViewportSize({ width: viewport, height: 800 });
    await page.getByRole('button', { name: trigger }).click();
    const panel = page.getByRole('dialog', { name: title });
    await expect.poll(async () => (await panel.boundingBox())!.width).toBeCloseTo(viewport, 0);
    await expect(panel).toHaveCSS('padding-left', '44px');
    await expect(panel).toHaveCSS('padding-right', '44px');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('a notice dismiss button is a circle tinted with the notice tone', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=alerts`);
  const notice = page
    .getByTestId('alerts-light')
    .locator('.env-alert')
    .filter({ has: page.getByRole('button', { name: 'Dismiss' }) });
  const dismiss = notice.getByRole('button', { name: 'Dismiss' });
  const box = (await dismiss.boundingBox())!;
  expect(Math.abs(box.width - box.height)).toBeLessThan(0.5);
  await expect(dismiss).toHaveCSS('border-top-left-radius', '50%');
  const tone = await notice.evaluate(
    (element) => getComputedStyle(element.querySelector('.env-alert-icon')!).color,
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
