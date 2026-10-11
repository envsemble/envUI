import { test, expect, type Page } from '@playwright/test';

const fixture = 'http://127.0.0.1:8766/?fixture=adoption';
const shellFixture = 'http://127.0.0.1:8766/?fixture=shell';

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('LinkProvider routes destinations and leaves disabled links native', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const projects = page.getByTestId('router-button');
  await expect(projects).toHaveAttribute('data-router-link', '');
  await projects.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/projects');
  await expect(page).toHaveURL(/fixture=adoption$/);
  const disabled = page.getByTestId('disabled-link');
  await expect(disabled).not.toHaveAttribute('data-router-link');
  await expect(disabled).not.toHaveAttribute('href');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test('ThemePreferenceProvider stores the choice and themes the document root', async ({ page }) => {
  await page.goto(fixture);
  const root = page.locator('html');
  const before = await root.getAttribute('data-env-theme');
  await page.getByTestId('theme-toggle').click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(root).toHaveAttribute('data-env-theme', after);
  await expect(root).toHaveClass(/env-theme/);
  expect(await page.evaluate(() => localStorage.getItem('fixture-theme'))).toBe(after);
  await page.reload();
  await expect(root).toHaveAttribute('data-env-theme', after);
  await expect(page.getByTestId('theme-toggle')).toHaveAccessibleName(
    `Switch to ${after === 'dark' ? 'light' : 'dark'} theme`,
  );
});

test('the bootstrap script applies a stored theme before the application renders', async ({
  page,
}) => {
  await page.goto(fixture);
  const script = await page
    .getByTestId('bootstrap-script')
    .evaluate((element) => element.textContent ?? '');
  const result = await page.evaluate((source) => {
    localStorage.setItem('bootstrap-theme', 'dark');
    const root = document.documentElement;
    root.removeAttribute('data-env-theme');
    new Function(source)();
    return { theme: root.dataset.envTheme, scheme: root.style.colorScheme };
  }, script);
  expect(result).toEqual({ theme: 'dark', scheme: 'dark' });
});

test('SearchField clears with its button and with Escape inside a dialog', async ({ page }) => {
  await page.goto(fixture);
  const search = page.getByRole('searchbox', { name: 'Search members' });
  await expect(search).toHaveAttribute('placeholder', 'Search by name');
  await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0);
  await search.fill('alex');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  const button = page.getByRole('button', { name: 'Open pending dialog' });
  // The whole field, not only its well, lines up with an adjacent button.
  const field = await search.locator('xpath=../..').boundingBox();
  const action = await button.boundingBox();
  expect(Math.round(field!.height)).toBe(Math.round(action!.height));

  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  const inner = dialog.getByRole('searchbox', { name: 'Search inside dialog' });
  await inner.focus();
  await page.keyboard.press('Escape');
  await expect(inner).toHaveValue('');
  await expect(dialog).toBeVisible();
});

test('a pending Dialog cannot be dismissed until the work finishes', async ({ page }) => {
  await page.goto(fixture);
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

test('Menu supports keyboard navigation, actions and routed destinations', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Account', exact: true });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(2);
  // Opening from the keyboard highlights the first item.
  await expect(menu.getByRole('menuitem', { name: 'Account settings' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Sign out' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('menu-action')).toHaveText('Signed out');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  const link = page.getByRole('menuitem', { name: 'Account settings' });
  await expect(link).toHaveAttribute('data-router-link', '');
  await link.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/account');
  expect(errors).toEqual([]);
});

test('Tooltip describes a disabled control on keyboard focus', async ({ page }) => {
  await page.goto(fixture);
  const target = page.locator('.env-tooltip-disabled-target');
  await target.focus();
  await expect(page.getByText('All seats are assigned')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('All seats are assigned')).toHaveCount(0);
});

test('error states, meters and avatars expose their semantics', async ({ page }) => {
  await page.goto(fixture);
  await expect(page.getByRole('alert')).toContainText('Products couldn’t load');
  const meter = page.getByRole('meter', { name: 'Seats assigned' });
  await expect(meter).toHaveAttribute('aria-valuenow', '5');
  // A failed picture shows the default person picture; initials are opt-in.
  const broken = page.getByRole('img', { name: 'Broken Picture' });
  await expect(broken.locator('svg.env-avatar-person')).toBeVisible();
  await expect(broken).not.toContainText('BP');
  const initials = page.getByRole('img', { name: 'Organization Name' });
  await expect(initials).toContainText('ON');
  // Initials share the blue of the default person picture.
  const fill = await page
    .locator('.env-avatar-person-background')
    .first()
    .evaluate((element) => getComputedStyle(element).fill);
  await expect(initials).toHaveCSS('background-color', fill);
});

test('AvatarButton shows a halo on hover and while its menu is open, and names the account', async ({
  page,
}) => {
  await page.goto(fixture);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await trigger.hover();
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.env-tooltip')).toContainText('alex@example.com');
  await trigger.click();
  await expect(page.getByRole('menu', { name: 'Account', exact: true })).toBeVisible();
  await page.mouse.move(1, 1);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('compact fields can float their label into the outline and keep the button height', async ({
  page,
}) => {
  await page.goto(fixture);
  const field = page.getByTestId('compact-label');
  const well = field.locator('xpath=..');
  const label = well.locator('label');
  await expect(label).toBeVisible();
  const resting = (await label.boundingBox())!;
  const wellBox = (await well.boundingBox())!;
  expect(resting.y).toBeGreaterThan(wellBox.y);
  await field.fill('Northwind');
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(wellBox.y + 2);
  const button = page.getByTestId('compact-label-toolbar').getByRole('button', { name: 'Apply' });
  expect(Math.round(wellBox.height)).toBe(Math.round((await button.boundingBox())!.height));
});

test('a pending button keeps its size, reports busy and ignores presses', async ({ page }) => {
  await page.goto(fixture);
  const button = page.getByTestId('pending-button');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button.locator('.env-spinner')).toBeVisible();
  await expect(button.locator('.env-button-content')).toHaveCSS('visibility', 'hidden');
  await button.click({ force: true });
  await expect(page.getByTestId('pending-presses')).toHaveText('0');
  await expect(page.getByRole('progressbar', { name: 'Refreshing seats' })).toBeVisible();
});

test('LoadingBar waits before appearing, then completes and leaves', async ({ page }) => {
  await page.goto(fixture);
  const toggle = page.getByRole('button', { name: 'Toggle loading' });
  const bar = page.getByRole('progressbar', { name: 'Loading next page' });
  // Quick work never shows the bar.
  await toggle.click();
  await toggle.click();
  await page.waitForTimeout(400);
  await expect(bar).toHaveCount(0);
  await toggle.click();
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('data-state', 'running');
  await toggle.click();
  await expect(bar).toHaveAttribute('data-state', 'finishing');
  await expect(bar).toHaveCount(0);
});

test('OrganizationMenu switches organizations and offers creating one', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const trigger = page.getByRole('button', { name: 'Northwind Labs' });
  await trigger.click();
  const menu = page.getByRole('menu', { name: 'Organizations', exact: true });
  await expect(menu).toContainText('Organizations');
  await expect(menu.getByRole('menuitemradio', { name: 'Northwind Labs' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  // Choosing the active organization again does not switch.
  await menu.getByRole('menuitemradio', { name: 'Northwind Labs' }).click();
  await expect(menu).toBeHidden();
  await expect(page.getByTestId('menu-action')).toHaveText('');

  await trigger.click();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menuitemradio', { name: 'Contoso' }).click();
  await expect(page.getByTestId('menu-action')).toHaveText('Selected contoso');
  await expect(page.getByRole('button', { name: 'Contoso' })).toBeFocused();

  await page.getByRole('button', { name: 'Contoso' }).click();
  await page.getByRole('menuitem', { name: 'Create organization' }).click();
  await expect(page.getByTestId('menu-action')).toHaveText('Create organization');

  // The trigger is an ordinary secondary button.
  await expect(page.getByRole('button', { name: 'Contoso' })).toHaveClass(/env-button-secondary/);
  await page
    .getByTestId('no-organization')
    .getByRole('button', { name: 'Create organization' })
    .click();
  await expect(page.getByTestId('menu-action')).toHaveText('Create first organization');
  expect(errors).toEqual([]);
});

test('motion settles presses and respects reduced motion', async ({ page }) => {
  await page.goto(fixture);
  const skeleton = page.locator('.env-skeleton').first();
  await expect(skeleton).toHaveCSS('animation-name', 'env-motion-pulse');
  const button = page.getByTestId('router-button');
  await button.hover();
  await page.mouse.down();
  await expect(button).not.toHaveCSS('transform', 'none');
  await page.mouse.up();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(skeleton).toHaveCSS('animation-name', 'none');
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.up();
});

test.describe('AppShell', () => {
  test('collapses, persists its preference and expands on hover', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(shellFixture);
    const shell = page.locator('.env-app-shell');
    const sidebar = page.locator('.env-app-sidebar');
    await expect(page.getByRole('link', { name: 'Home' })).toHaveText('Home');
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(shell).toHaveAttribute('data-compact', '');
    expect(await page.evaluate(() => localStorage.getItem('fixture-sidebar'))).toBe('true');
    // The pointer stays over the toggle, so the collapsed sidebar does not reopen at once.
    await expect(page.getByRole('link', { name: 'Home' })).toHaveText('');
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeLessThan(80);

    await page.mouse.move(700, 500);
    await page.getByRole('link', { name: 'Products' }).hover();
    await expect(shell).toHaveAttribute('data-expanded-overlay', '');
    await expect(page.getByRole('link', { name: 'Products' })).toHaveText('Products');
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeGreaterThan(150);
    await page.mouse.move(700, 500);
    await expect(shell).toHaveAttribute('data-compact', '');

    await page.reload();
    await expect(shell).toHaveAttribute('data-collapsed', '');
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(shell).not.toHaveAttribute('data-collapsed');
    expect(errors).toEqual([]);
  });

  test('an open popup from the context area keeps the sidebar expanded', async ({ page }) => {
    await page.goto(shellFixture);
    await page.evaluate(() => localStorage.setItem('fixture-sidebar', 'true'));
    await page.reload();
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-compact', '');
    await page.getByRole('button', { name: 'Expand sidebar' }).hover();
    await expect(shell).toHaveAttribute('data-expanded-overlay', '');
    await page
      .getByTestId('context-trigger')
      .evaluate((trigger) => trigger.setAttribute('aria-expanded', 'true'));
    await page.mouse.move(700, 500);
    await expect(shell).toHaveAttribute('data-expanded-overlay', '');
    await page
      .getByTestId('context-trigger')
      .evaluate((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    await expect(shell).toHaveAttribute('data-compact', '');
  });

  test('the expanded sidebar fits its content within its bounds and remembers the width', async ({
    page,
  }) => {
    await page.goto(shellFixture);
    const shell = page.locator('.env-app-shell');
    const sidebar = page.locator('.env-app-sidebar');
    const measured = async () =>
      Number(
        (
          await shell.evaluate((element) =>
            element.style.getPropertyValue('--env-sidebar-content-width'),
          )
        ).replace('px', ''),
      );
    await expect.poll(measured).toBeGreaterThan(0);
    const width = (await sidebar.boundingBox())!.width;
    expect(width).toBeCloseTo(Math.min(Math.max(await measured(), 192), 320), 0);
    expect(await page.evaluate(() => localStorage.getItem('fixture-sidebar-width'))).toBe(
      String(await measured()),
    );
    // Longer context content widens the sidebar up to its maximum.
    await page
      .getByTestId('context-trigger')
      .evaluate((element) => (element.textContent = 'Northwind Laboratories International'));
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeGreaterThan(width);
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeLessThanOrEqual(320);
  });

  test('the loading bar runs along the bottom edge of the topbar', async ({ page }) => {
    await page.goto(shellFixture);
    await page.getByRole('button', { name: 'Toggle page loading' }).click();
    const bar = page.getByRole('progressbar', { name: 'Loading page' });
    await expect(bar).toBeVisible();
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    const box = (await bar.boundingBox())!;
    expect(Math.abs(box.y - (topbar.y + topbar.height - 1))).toBeLessThanOrEqual(1);
    expect(box.width).toBeCloseTo(topbar.width, 0);
  });

  test('narrow viewports open the sidebar over the content and close it after navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(shellFixture);
    const sidebar = page.locator('.env-app-sidebar');
    await expect(sidebar).toBeHidden();
    await expect(page.locator('.env-app-title')).toBeHidden();
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toHaveText('Products');
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(sidebar).toBeHidden();
    await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/products');
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await page.keyboard.press('Escape');
    await expect(sidebar).toBeHidden();
  });
});

/** Contrast between a control's fill and the surface under it, composited as the browser paints it. */
async function fillContrast(control: import('@playwright/test').Locator, surface: string) {
  return control.evaluate((element, surfaceSelector) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const paint = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
    };
    const base = getComputedStyle(element.closest(surfaceSelector)!).backgroundColor;
    const fill = getComputedStyle(element).backgroundColor;
    const [lighter, darker] = [paint([base]), paint([base, fill])].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  }, surface);
}

test('secondary buttons stay distinct on the canvas, rows and dialog panes in both themes', async ({
  page,
}) => {
  await page.goto(fixture);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByTestId('theme-toggle').click();
    await page.keyboard.press('Escape');
    const row = page.getByTestId('secondary-row');
    // Colors transition after the theme changes; poll until they settle.
    await expect
      .poll(() => fillContrast(row.getByRole('button', { name: 'Remove' }), '.env-row'))
      .toBeGreaterThan(1.08);
    await page.getByRole('button', { name: 'Open pending dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Save project' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' }).last();
    await expect.poll(() => fillContrast(cancel, '.env-modal-pane')).toBeGreaterThan(1.08);
    await cancel.click();
    await expect(dialog).toBeHidden();
  }
});
