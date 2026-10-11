import { test, expect, type Page } from '@playwright/test';

const fixture = 'http://127.0.0.1:8766/?fixture=adoption';

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

test('secondary buttons stay distinguishable on row fills', async ({ page }) => {
  await page.goto(fixture);
  const row = page.getByTestId('secondary-row');
  const colors = await row.evaluate((element) => ({
    row: getComputedStyle(element).backgroundColor,
    button: getComputedStyle(element.querySelector('button')!).backgroundColor,
  }));
  expect(colors.button).not.toBe(colors.row);
});
