import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;

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
      '<html data-env-contrast="high" data-env-contrast-source="envui:high"',
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
      '<html data-env-contrast="standard" data-env-contrast-source="envui:standard"',
    );
    await route.fulfill({ response, body });
  });
  await page.goto(url);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await expect(root).toHaveAttribute('data-env-contrast-source', 'envui:high');
  // The contrast is now the provider's own, so following the system removes it.
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect(root).not.toHaveAttribute('data-env-contrast');
});

test('a provider mounted again removes the contrast its predecessor wrote', async ({ page }) => {
  // Keyed by the user, the provider mounts again for the second user, whose stored contrast is
  // system: the first user's high contrast must not stay on the root.
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast-remount`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await page.getByRole('button', { name: 'Switch to the second user' }).click();
  await expect(root).not.toHaveAttribute('data-env-contrast');
  await expect(root).not.toHaveAttribute('data-env-contrast-source');
});

test('a provider leaves a contrast the application wrote over its own', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast-provider`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  // The application sets the root's contrast itself, leaving envUI's marker in place.
  await root.evaluate((element) => element.setAttribute('data-env-contrast', 'standard'));
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect(root).toHaveAttribute('data-env-contrast', 'standard');
  await expect(root).not.toHaveAttribute('data-env-contrast-source');
});

test('a provider keeps the same contrast the application wrote once it removed the marker', async ({
  page,
}) => {
  // The same value over envUI's can't be told apart from it while the marker matches, as
  // docs/setup.md says; without the marker, the contrast is the application's.
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast-provider`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await root.evaluate((element) => {
    element.setAttribute('data-env-contrast', 'high');
    element.removeAttribute('data-env-contrast-source');
  });
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
});

test('a provider at system leaves the contrast another mounted provider wrote', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast-nested`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  // The inner provider applies its theme to the root again, at system contrast.
  const before = await root.getAttribute('data-env-theme');
  await page.getByTestId('inner-theme-toggle').click();
  await expect(root).not.toHaveAttribute('data-env-theme', before!);
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  // The outer provider's compact scale stays too.
  await expect(root).toHaveAttribute('data-env-scale', 'compact');
  await expect(root).toHaveAttribute('data-env-scale-source', 'envui:compact');
  // Only one provider should apply to the document, and development says so.
  expect(errors.filter((error) => error.includes('applyToDocument={false}'))).toHaveLength(1);
});

test('a provider without a scale leaves the scale the page set on the root', async ({ page }) => {
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('<html', '<html data-env-scale="compact"');
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  const root = page.locator('html');
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-env-scale', 'compact');
  await expect(root).not.toHaveAttribute('data-env-scale-source');
});

test('a provider without a scale removes the scale the bootstrap script wrote', async ({
  page,
}) => {
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      '<html',
      '<html data-env-scale="compact" data-env-scale-source="envui:compact"',
    );
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  const root = page.locator('html');
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await expect(root).not.toHaveAttribute('data-env-scale');
  await expect(root).not.toHaveAttribute('data-env-scale-source');
});

test('a provider without a scale leaves a scale the page wrote over the bootstrap script one', async ({
  page,
}) => {
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      '<html',
      '<html data-env-scale="comfortable" data-env-scale-source="envui:compact"',
    );
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  const root = page.locator('html');
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await expect(root).toHaveAttribute('data-env-scale', 'comfortable');
  await expect(root).not.toHaveAttribute('data-env-scale-source');
});

/** Serves the adoption fixture with these attributes on its root, as a server or the page sets them. */
async function withRoot(page: Page, attributes: string) {
  await page.route(`${fixtureUrl}/?fixture=adoption`, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace('<html', `<html ${attributes}`);
    await route.fulfill({ response, body });
  });
  await page.goto(`${fixtureUrl}/?fixture=adoption`);
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
}

test('a provider without a scale gives the application the scale the page set on the root', async ({
  page,
}) => {
  await withRoot(page, 'data-env-scale="compact"');
  // The boundary, a Theme nested in it and the popups of both take the root's compact scale, as
  // the page and other libraries' portals do.
  const boundary = page.locator('.fixture-adoption');
  await expect(boundary).toHaveAttribute('data-env-scale', 'compact');
  await expect(page.getByTestId('adoption-nested-theme')).toHaveAttribute(
    'data-env-scale',
    'compact',
  );
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await expect(
    page
      .getByRole('menu', { name: 'Account' })
      .locator('xpath=ancestor::*[contains(@class, "env-theme")][1]'),
  ).toHaveAttribute('data-env-scale', 'compact');
  // The root keeps the page's scale, unmarked, and so does the boundary when the page changes it.
  await expect(page.locator('html')).not.toHaveAttribute('data-env-scale-source');
  await page.locator('html').evaluate((root) => root.setAttribute('data-env-scale', 'comfortable'));
  await expect(boundary).toHaveAttribute('data-env-scale', 'comfortable');
});

test('a provider without a scale keeps comfortable where envUI wrote the root scale', async ({
  page,
}) => {
  await withRoot(page, 'data-env-scale="compact" data-env-scale-source="envui:compact"');
  await expect(page.locator('html')).not.toHaveAttribute('data-env-scale');
  await expect(page.locator('.fixture-adoption')).toHaveAttribute('data-env-scale', 'comfortable');
});

for (const contrast of ['high', 'standard'] as const)
  test(`a provider without a contrast gives the application the ${contrast} contrast the page set on the root`, async ({
    page,
  }) => {
    await withRoot(page, `data-env-contrast="${contrast}"`);
    await expect(page.locator('.fixture-adoption')).toHaveAttribute('data-env-contrast', contrast);
    await expect(page.getByTestId('adoption-nested-theme')).toHaveAttribute(
      'data-env-contrast',
      contrast,
    );
    // The page's contrast stays its own: the provider never marks it as envUI's.
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-env-contrast', contrast);
    await expect(page.locator('html')).not.toHaveAttribute('data-env-contrast-source');
  });

test('a provider releases the root scale and contrast once it stops applying to the document', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=theme-release`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await expect(root).toHaveAttribute('data-env-scale', 'compact');
  await page.getByRole('button', { name: 'Stop applying to the document' }).click();
  for (const attribute of [
    'data-env-contrast',
    'data-env-contrast-source',
    'data-env-scale',
    'data-env-scale-source',
  ])
    await expect(root).not.toHaveAttribute(attribute);
  // The boundary around the children keeps them.
  await expect(page.locator('.fixture-main')).toHaveAttribute('data-env-scale', 'compact');
});

test('a provider releases the root scale and contrast when it unmounts', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=theme-release`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-scale', 'compact');
  await page.getByRole('button', { name: 'Unmount the provider' }).click();
  await expect(page.getByText('Provider content')).toHaveCount(0);
  for (const attribute of [
    'data-env-contrast',
    'data-env-contrast-source',
    'data-env-scale',
    'data-env-scale-source',
  ])
    await expect(root).not.toHaveAttribute(attribute);
});

test('a provider that unmounts leaves a scale and contrast the page wrote over its own', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=theme-release`);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-env-scale', 'compact');
  await root.evaluate((element) => {
    element.setAttribute('data-env-scale', 'comfortable');
    element.setAttribute('data-env-contrast', 'standard');
  });
  await page.getByRole('button', { name: 'Unmount the provider' }).click();
  await expect(page.getByText('Provider content')).toHaveCount(0);
  await expect(root).toHaveAttribute('data-env-scale', 'comfortable');
  await expect(root).toHaveAttribute('data-env-contrast', 'standard');
  await expect(root).not.toHaveAttribute('data-env-scale-source');
  await expect(root).not.toHaveAttribute('data-env-contrast-source');
});

test(
  'a theme chosen in one window applies in the other windows of the same origin',
  { tag: '@engines' },
  async ({ context }) => {
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
  },
);

test('ThemePreferenceProvider stores the choice and themes the document root', async ({ page }) => {
  await page.goto(adoption);
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

for (const source of ['system', 'stored'] as const) {
  test(`the browser theme color follows the canvas of a ${source} dark theme`, async ({ page }) => {
    // The page starts with a static light theme color, as an application's index.html might.
    await page.emulateMedia({ colorScheme: source === 'system' ? 'dark' : 'light' });
    if (source === 'stored')
      await page.addInitScript(() => localStorage.setItem('fixture-theme', 'dark'));
    await page.goto(adoption);
    await expect(page.locator('html')).toHaveAttribute('data-env-theme', 'dark');
    const canvas = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    );
    expect(canvas).not.toBe('rgb(255, 255, 255)');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', canvas);
  });
}

test('the browser theme color follows the canvas of the resolved theme', async ({ page }) => {
  // The page starts with a static light theme color, as an application's index.html might.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(adoption);
  const root = page.locator('html');
  const meta = page.locator('meta[name="theme-color"]');
  const canvas = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  await expect(root).toHaveAttribute('data-env-theme', 'dark');
  const dark = await canvas();
  expect(dark).not.toBe('rgb(255, 255, 255)');
  await expect(meta).toHaveAttribute('content', dark);
  // A tag written for a system color scheme follows the chosen theme too.
  await page.evaluate(() => {
    const scheme = document.createElement('meta');
    scheme.name = 'theme-color';
    scheme.media = '(prefers-color-scheme: dark)';
    scheme.content = '#000000';
    document.head.append(scheme);
  });
  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-env-theme', 'light');
  const light = await canvas();
  await expect(meta).toHaveCount(2);
  await expect(meta.first()).toHaveAttribute('content', light);
  await expect(meta.last()).toHaveAttribute('content', light);
  await page.getByTestId('theme-toggle').click();
  await expect(meta.first()).toHaveAttribute('content', dark);
  await expect(meta.last()).toHaveAttribute('content', dark);
});
