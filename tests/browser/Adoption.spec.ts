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
  await expect(page.getByRole('img', { name: 'Organization Name' })).toContainText('ON');
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
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeGreaterThan(200);
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

test('secondary buttons stay distinguishable on row fills', async ({ page }) => {
  await page.goto(fixture);
  const row = page.getByTestId('secondary-row');
  const colors = await row.evaluate((element) => ({
    row: getComputedStyle(element).backgroundColor,
    button: getComputedStyle(element.querySelector('button')!).backgroundColor,
  }));
  expect(colors.button).not.toBe(colors.row);
});
