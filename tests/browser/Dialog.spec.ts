import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;

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

test(
  'popovers open from their trigger, close on Escape and outside presses, and return focus',
  { tag: '@engines' },
  async ({ page }) => {
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
      // The form is as wide as its field, within lg's 28 rem.
      const formWidth = (await form.boundingBox())!.width;
      expect(formWidth).toBeGreaterThanOrEqual(192);
      expect(formWidth).toBeLessThanOrEqual(448);
      await form.getByRole('textbox', { name: 'Name' }).fill('Plan.md');
      await form.getByRole('button', { name: 'Save name' }).click();
      await expect(form).toBeHidden();
      await expect(page.getByTestId(`popover-result-${theme}`)).toHaveText('Renamed');
    }
  },
);

test('popovers size to their content, from 12 rem up to their width, and stay in a narrow window', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=popover`);
  const scope = page.getByTestId('popover-light');
  await scope.getByRole('button', { name: 'Details light' }).click();
  const details = page.getByRole('dialog', { name: 'Document details' });
  await expect(details).toBeVisible();
  // A title and a short line: narrower than md's 20 rem, never under 12 rem.
  const short = (await details.boundingBox())!.width;
  expect(short).toBeGreaterThanOrEqual(192);
  expect(short).toBeLessThan(320);
  await page.keyboard.press('Escape');
  await expect(details).toBeHidden();
  await page.setViewportSize({ width: 300, height: 700 });
  await scope.getByRole('button', { name: 'Rename light' }).click();
  const form = page.getByRole('dialog', { name: 'Rename light' });
  await expect(form).toBeVisible();
  await expect(async () => {
    const box = (await form.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(300);
  }).toPass();
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

/** The computed look of a popup's or a dialog's surface. */
const surface = (locator: import('@playwright/test').Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
      radius: style.borderTopLeftRadius,
      shadow: style.boxShadow,
      filter: style.backdropFilter,
    };
  });

/** A color token resolved inside the first theme boundary of the page. */
const token = (page: import('@playwright/test').Page, name: string) =>
  page.locator('body').evaluate((body, name) => {
    const probe = document.createElement('div');
    probe.style.background = `var(${name})`;
    (body.querySelector('.env-theme') ?? body).append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, name);

test('dialogs take the popups’ fill and shadow with no edge, solid over the scrim; the command palette and popovers are frosted', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=popover`);
  await page.getByRole('button', { name: 'Details light' }).click();
  const popover = await surface(page.getByRole('dialog', { name: 'Document details' }));
  // The popup color at 88 % in light, over a blur, with no visible edge and the popups' shadow.
  expect(popover.background).toMatch(/\/ 0\.88\)$/);
  expect(popover.border).toMatch(/rgba\(0, 0, 0, 0\)$/);
  expect(popover.shadow).not.toBe('none');
  expect(popover.filter).toMatch(/^blur\(/);

  await page.goto(`${fixtureUrl}/?fixture=palette`);
  await page.getByRole('button', { name: 'Quick open light' }).focus();
  await page.keyboard.press('Enter');
  expect(await surface(page.getByRole('dialog', { name: 'Go to document' }))).toEqual(popover);

  // A dialog: the popup color, solid, with the popups' shadow and corners and no visible edge.
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  await page.getByRole('button', { name: 'Open wide dialog' }).click();
  const dialog = await surface(page.getByRole('dialog', { name: 'Wide details' }));
  expect(dialog).toEqual({
    ...popover,
    background: await token(page, '--env-color-bg-popup'),
    filter: 'none',
  });
});

test('a dark dialog takes the dark popups’ fill, the default surface', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  await page.getByRole('button', { name: 'Open dark dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Dark theme dialog', exact: true });
  const fill = await dialog.evaluate((element) => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--env-color-bg-default)';
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  const look = await surface(dialog);
  expect(look.background).toBe(fill);
  expect(look.border).toMatch(/rgba\(0, 0, 0, 0\)$/);
  expect(look.shadow).not.toBe('none');
});

test('where popups are solid, a dialog is too: its edge returns and its shadow goes', async ({
  page,
}) => {
  await page.emulateMedia({ contrast: 'more' });
  await page.goto(`${fixtureUrl}/?fixture=dialog-variants`);
  await page.getByRole('button', { name: 'Open wide dialog' }).click();
  const dialog = await surface(page.getByRole('dialog', { name: 'Wide details' }));
  // The solid popup's fill, no shadow or blur, and the dialog's level of edge, which is visible.
  expect(dialog.background).toBe(await token(page, '--env-color-bg-popup'));
  expect(dialog.shadow).toBe('none');
  expect(dialog.filter).toBe('none');
  expect(dialog.border).toMatch(/^1px solid /);
  expect(dialog.border).not.toMatch(/rgba\(0, 0, 0, 0\)$/);
  expect(dialog.border.replace(/^1px solid /, '')).toBe(
    await token(page, '--env-elevation-3-border'),
  );
});

test(
  'Dialog traps and restores focus and its nested Select retains the dark theme',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=forms`);
    const trigger = page.getByRole('button', { name: 'Open dark dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Dark theme dialog', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription('A nested theme retained in a portal.');
    await expect
      .poll(() =>
        dialog.evaluate((element) =>
          element.closest('[data-env-theme]')?.getAttribute('data-env-theme'),
        ),
      )
      .toBe('dark');
    const firstField = dialog.getByRole('textbox', { name: 'Dialog first field', exact: true });
    await expect(firstField).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Save dialog', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(firstField).toBeFocused();

    const select = dialog.getByRole('combobox', { name: 'Dialog choice', exact: true });
    await select.click();
    const option = page.getByRole('option', { name: 'Boreal', exact: true });
    await expect(option).toBeVisible();
    await expect
      .poll(() =>
        option.evaluate((element) =>
          element.closest('[data-env-theme]')?.getAttribute('data-env-theme'),
        ),
      )
      .toBe('dark');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('dialog-status')).toHaveText('closed');
    await expect(trigger).toBeFocused();
  },
);

test('Dialog provides an accessible dismissal action and controlled action closure', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const trigger = page.getByRole('button', { name: 'Open dark dialog', exact: true });
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('a pending Dialog cannot be dismissed until the work finishes', async ({ page }) => {
  await page.goto(adoption);
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  await dialog.getByRole('button', { name: 'Toggle pending' }).click();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Toggle pending' }).click();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
});
