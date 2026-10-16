import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a provider without a contrast leaves the contrast the page set on the root', async ({
  page,
}) => {
  // The document arrives with a contrast on its root, as a server or the bootstrap script sets it.
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('<html', '<html data-env-contrast="standard"');
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  const root = page.locator('html');
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await expect(root).toHaveAttribute('data-env-contrast', 'standard');
  const before = await root.getAttribute('data-env-theme');
  await page.getByTestId('theme-toggle').click();
  await expect(root).not.toHaveAttribute('data-env-theme', before!);
  await expect(root).toHaveAttribute('data-env-contrast', 'standard');
});

test('a provider at system removes the contrast the bootstrap script wrote', async ({ page }) => {
  // The bootstrap script was built with a high contrast, but the provider, as for a contrast the
  // user chose and the application stores, now asks for system. A reload must not keep high.
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      '<html',
      '<html data-env-contrast="high" data-env-contrast-source="bootstrap"',
    );
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  const root = page.locator('html');
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await expect(root).not.toHaveAttribute('data-env-contrast');
  await expect(root).not.toHaveAttribute('data-env-contrast-source');
});

test('a provider with a contrast replaces the one the bootstrap script wrote', async ({ page }) => {
  const url = `${fixtureUrl}/?fixture=theme-contrast-provider`;
  await page.route(url, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      '<html',
      '<html data-env-contrast="standard" data-env-contrast-source="bootstrap"',
    );
    await route.fulfill({ response, body });
  });
  await page.goto(url);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await expect(root).not.toHaveAttribute('data-env-contrast-source');
  // The contrast is now the provider's own, so following the system removes it.
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect(root).not.toHaveAttribute('data-env-contrast');
});

test('a theme chosen in one window applies in the other windows of the same origin', async ({
  context,
}) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto(`${fixtureUrl}/?fixture=adoption`);
  await second.goto(`${fixtureUrl}/?fixture=adoption`);
  const before = await second.locator('html').getAttribute('data-env-theme');
  const after = before === 'dark' ? 'light' : 'dark';

  await first.getByTestId('theme-toggle').click();
  await expect(first.locator('html')).toHaveAttribute('data-env-theme', after);
  await expect(second.locator('html')).toHaveAttribute('data-env-theme', after);
  await expect(second.getByTestId('theme-toggle')).toHaveAccessibleName(
    `Switch to ${after === 'dark' ? 'light' : 'dark'} theme`,
  );

  // Clearing the stored choice returns the other window to the default preference.
  await first.evaluate(() => localStorage.removeItem('fixture-theme'));
  await second.evaluate(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'fixture-theme',
        newValue: null,
        storageArea: localStorage,
      }),
    ),
  );
  const system = await second.evaluate(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  await expect(second.locator('html')).toHaveAttribute('data-env-theme', system);
});
