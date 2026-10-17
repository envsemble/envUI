import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const rails = `${fixtureUrl}/?fixture=sidebar-rails`;
const sidebars = `${fixtureUrl}/?fixture=sidebars`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** A fresh page: no remembered state, and boxes final at once. */
async function open(page: Page, url: string, key: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await page.evaluate((name) => localStorage.removeItem(name), key);
  await page.reload();
}

test.describe('A rail that opens on hover', () => {
  test.use({ viewport: { width: 1100, height: 760 } });

  test('it opens after a rest, over the content, and closes as the pointer leaves', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const main = page.locator('.env-app-shell-main');
    // Below dockAt (xl) it is a rail, whatever the preference.
    await expect(primary).toHaveAttribute('data-rail', '');
    await expect(page.getByTestId('app-name')).toBeHidden();
    const before = await box(main);
    await page.mouse.move(30, 400);
    // A rest of 200 ms opens it.
    await expect(primary).toHaveAttribute('data-peek', '');
    await expect(primary).toHaveAttribute('data-state', 'collapsed');
    await expect(primary.getByRole('link', { name: 'Projects' })).toHaveText('Projects');
    expect(await box(main)).toEqual(before);
    await page.mouse.move(600, 400);
    await expect(primary).not.toHaveAttribute('data-peek');
    expect(errors).toEqual([]);
  });

  test('a press during the rest cancels it, so a quick click reaches what it started on', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const projects = await box(primary.getByRole('link', { name: 'Projects' }));
    await page.mouse.move(projects.x + projects.width / 2, projects.y + projects.height / 2);
    await page.mouse.down();
    // Just past the 200 ms rest: it stayed a rail.
    await page.waitForTimeout(300);
    await expect(primary).toHaveAttribute('data-rail', '');
    await page.mouse.up();
    await expect(page).toHaveURL(/#\/projects$/);
  });

  test('with peek="hover", Tab into the rail leaves it a rail; with hover-focus it opens', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(primary.locator(':focus')).toHaveCount(1);
    await expect(primary).toHaveAttribute('data-rail', '');

    await page.goto(`${rails}&peek=hover-focus`);
    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(primary).toHaveAttribute('data-peek', '');
  });

  test('its menu holds it open until it closes, and a link closes it', async ({ page }) => {
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    await primary.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('menuitem', { name: 'Folder' }).hover();
    await page.mouse.move(600, 600);
    await expect(page.getByRole('menu', { name: 'Create' })).toBeVisible();
    await expect(primary).toHaveAttribute('data-peek', '');
    await page.keyboard.press('Escape');
    await expect(primary).not.toHaveAttribute('data-peek');

    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    await primary.getByRole('link', { name: 'Projects' }).click();
    await expect(primary).not.toHaveAttribute('data-peek');
    await expect(primary).toHaveAttribute('data-rail', '');
  });

  test('the trigger holds it open until an outside press or Escape, keeping the focused node', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const trigger = primary.getByRole('button', { name: 'Expand sidebar' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(primary).toHaveAttribute('data-held', '');
    await expect(primary.getByRole('button', { name: 'Collapse sidebar' })).toBeFocused();
    // The focused element is the same node, rail or not.
    const marked = await primary
      .getByRole('link', { name: 'Home' })
      .evaluate((element) => ((element as HTMLElement).dataset.marked = 'yes'));
    expect(marked).toBe('yes');
    await page.mouse.click(600, 600);
    await expect(primary).not.toHaveAttribute('data-held');
    await expect(primary.getByRole('link', { name: 'Home' })).toHaveAttribute('data-marked', 'yes');
    // Escape closes a hold too.
    await primary.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(primary).toHaveAttribute('data-held', '');
    await page.keyboard.press('Escape');
    await expect(primary).not.toHaveAttribute('data-held');
  });

  test('choosing a row in the directory dismisses its peek, independently of the start rail', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    const directory = page.getByRole('complementary', { name: 'Directory' });
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await expect(page.getByTestId('directory-avatars')).toBeVisible();
    await page.mouse.move(1080, 300);
    await expect(directory).toHaveAttribute('data-peek', '');
    await expect(primary).not.toHaveAttribute('data-peek');
    // It opens toward the content, from the inline end.
    const panel = await box(directory.locator('.env-sidebar-panel'));
    expect(panel.x + panel.width).toBeCloseTo(1100, 0);
    expect(panel.width).toBeGreaterThan(150);
    await directory.getByRole('button', { name: 'Sam Lee' }).click();
    await expect(page.getByTestId('chosen')).toHaveText('Sam Lee');
    await expect(directory).not.toHaveAttribute('data-peek');
  });

  test('right-to-left text mirrors the rails and their peek', async ({ page }) => {
    await open(page, `${rails}&dir=rtl`, 'fixture-rails');
    const directory = page.getByRole('complementary', { name: 'Directory' });
    expect((await box(directory)).x).toBeLessThan(100);
    await page.mouse.move(20, 300);
    await expect(directory).toHaveAttribute('data-peek', '');
    expect((await box(directory.locator('.env-sidebar-panel'))).x).toBeCloseTo(0, 0);
  });
});

test.describe('A rail from dockAt up', () => {
  test.use({ viewport: { width: 1400, height: 760 } });

  test('the trigger docks it, and each side remembers its own state', async ({ page }) => {
    await open(page, rails, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const directory = page.getByRole('complementary', { name: 'Directory' });
    await expect(primary).toHaveAttribute('data-state', 'expanded');
    await primary.getByRole('button', { name: 'Collapse sidebar' }).click();
    await page.mouse.move(700, 400);
    await expect(primary).toHaveAttribute('data-rail', '');
    // While it peeks the trigger docks it again.
    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    await primary.getByRole('button', { name: 'Keep sidebar open' }).click();
    await expect(primary).toHaveAttribute('data-state', 'expanded');
    await directory.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(directory).toHaveAttribute('data-state', 'collapsed');
    await page.reload();
    await expect(primary).toHaveAttribute('data-state', 'expanded');
    await expect(directory).toHaveAttribute('data-state', 'collapsed');
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('fixture-rails')))!)).toEqual(
      { start: { open: true }, end: { open: false } },
    );
  });
});

test.describe("A phone's top bar", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('it shows below the breakpoint, and each trigger opens its drawer from its side', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await header.getByRole('button', { name: 'Open navigation' }).click();
    const navigation = page.getByRole('dialog', { name: 'Primary' });
    expect((await box(navigation)).x).toBe(0);
    await page.keyboard.press('Escape');
    await expect(header.getByRole('button', { name: 'Open navigation' })).toBeFocused();
    await header.getByRole('button', { name: 'Open Directory' }).click();
    const directory = page.getByRole('dialog', { name: 'Directory' });
    const edge = await box(directory);
    expect(edge.x + edge.width).toBeCloseTo(390, 0);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1400, height: 844 });
    await expect(header).toBeHidden();
  });
});

test.describe('Sidebar.Handle', () => {
  test('arrow keys resize it in rem steps, Home and End reach its bounds, Enter collapses it', async ({
    page,
  }) => {
    await open(page, sidebars, 'fixture-settings');
    const settings = page.getByRole('navigation', { name: 'Settings' });
    const handle = settings.getByRole('separator', { name: 'Resize sidebar' });
    await expect(handle).toHaveAttribute('aria-valuemin', '192');
    await expect(handle).toHaveAttribute('aria-valuemax', '512');
    const start = Number(await handle.getAttribute('aria-valuenow'));
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 16));
    await expect.poll(async () => (await box(settings)).width).toBeCloseTo(start + 16, 0);
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '192');
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '512');
    await expect(page.getByTestId('width-changes')).toHaveText(/,32$/);
    // The width is kept in rem.
    expect(await page.evaluate(() => localStorage.getItem('fixture-settings'))).toBe(
      '{"start":{"open":true,"width":32}}',
    );
    await page.keyboard.press('Enter');
    await expect(settings).toHaveAttribute('data-state', 'collapsed');
    await expect(handle).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('Enter');
    await expect(settings).toHaveAttribute('data-state', 'expanded');
  });

  test('a drag resizes it and a click without a drag collapses it', async ({ page }) => {
    await open(page, sidebars, 'fixture-settings');
    const settings = page.getByRole('navigation', { name: 'Settings' });
    const handle = settings.getByRole('separator', { name: 'Resize sidebar' });
    const edge = await box(handle);
    const width = (await box(settings)).width;
    await page.mouse.move(edge.x + edge.width / 2, edge.y + 50);
    await page.mouse.down();
    await page.mouse.move(edge.x + edge.width / 2 + 40, edge.y + 50, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => (await box(settings)).width).toBeCloseTo(width + 40, 0);
    await expect(settings).toHaveAttribute('data-state', 'expanded');
    await handle.click();
    await expect(settings).toHaveAttribute('data-state', 'collapsed');
  });

  test('the arrow keys follow the text direction', async ({ page }) => {
    await open(page, sidebars, 'fixture-settings');
    await page
      .locator('[data-testid="settings-row"]')
      .evaluate((row) => row.setAttribute('dir', 'rtl'));
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    const start = Number(await handle.getAttribute('aria-valuenow'));
    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 16));
  });
});

test.describe('Sidebars without the frame', () => {
  test('a trigger outside the sidebar and the Mod+B shortcut share its provider', async ({
    page,
  }) => {
    await open(page, sidebars, 'fixture-settings');
    const settings = page.getByRole('navigation', { name: 'Settings' });
    const trigger = page.getByTestId('settings-trigger');
    await expect(trigger).toHaveAttribute('aria-controls', (await settings.getAttribute('id'))!);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(settings).toHaveAttribute('data-rail', '');
    // Groups: a heading at the given level, and a named group without one.
    await page.keyboard.press('ControlOrMeta+b');
    await expect(settings).toHaveAttribute('data-state', 'expanded');
    await expect(settings.getByRole('heading', { level: 2, name: 'Account' })).toBeVisible();
    await expect(settings.getByRole('group', { name: 'Workspace' })).toBeVisible();
    await expect(settings.getByRole('button', { name: 'Add account' })).toBeVisible();
    // Typing in a field keeps the key.
    await page.getByRole('textbox', { name: 'Bio' }).focus();
    await page.keyboard.press('ControlOrMeta+b');
    await expect(settings).toHaveAttribute('data-state', 'expanded');
  });

  test('an off-canvas sidebar leaves the page out of view and inert, and focus with it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(sidebars);
    const filters = page.getByRole('navigation', { name: 'Filters', includeHidden: true });
    const trigger = page.getByTestId('filters-trigger');
    await filters.getByRole('button', { name: 'Only mine' }).focus();
    await trigger.click();
    await expect(filters).toHaveAttribute('inert', '');
    await expect(filters).toHaveAttribute('data-state', 'collapsed');
    expect((await box(filters)).width).toBe(0);
    await expect(
      filters.getByRole('button', { name: 'Only mine', includeHidden: true }),
    ).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(filters).not.toHaveAttribute('inert');
    await expect(filters.getByRole('button', { name: 'Only mine' })).toBeVisible();
  });
});
