import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { openServerMarkup } from './ServerMarkup';

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

  test('it still opens on hover after the window narrows to the drawer and widens again', async ({
    page,
  }) => {
    await open(page, rails, 'fixture-rails');
    await page.setViewportSize({ width: 500, height: 760 });
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
    await page.setViewportSize({ width: 1100, height: 760 });
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await expect(primary).toHaveAttribute('data-rail', '');
    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    // A link inside still dismisses it.
    await primary.getByRole('link', { name: 'Projects' }).click();
    await expect(primary).not.toHaveAttribute('data-peek');
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

  test('a sidebar in Main keeps its own state, and the frame keeps its start sidebar', async ({
    page,
  }) => {
    await open(page, `${rails}&subnav`, 'fixture-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const sections = page.getByRole('navigation', { name: 'Settings sections' });
    await expect(sections).toBeVisible();
    // Not one of the frame's columns: not sticky, and the frame's controls stay the primary's.
    await expect(sections).not.toHaveAttribute('data-frame');
    await expect(primary).toHaveAttribute('data-frame', '');
    const id = (await primary.getAttribute('id'))!;
    await expect(primary.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
      'aria-controls',
      id,
    );
    const skipLinks = page.locator('.env-app-shell-skip-links');
    await expect(skipLinks.getByRole('link', { name: 'Skip to Primary' })).toHaveCount(1);
    await expect(skipLinks.getByRole('link', { name: 'Skip to Settings sections' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Remove settings sections' }).click();
    await expect(sections).toHaveCount(0);
    await expect(skipLinks.getByRole('link', { name: 'Skip to Primary' })).toHaveCount(1);
    await expect(primary.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
      'aria-controls',
      id,
    );
  });
});

test.describe('Remembered state', () => {
  test('a toggle keeps the state stored for a side without a sidebar on this page', async ({
    page,
  }) => {
    await open(page, sidebars, 'fixture-settings');
    await page.evaluate(() =>
      localStorage.setItem(
        'fixture-settings',
        JSON.stringify({ start: { open: true }, end: { open: false, width: 20 } }),
      ),
    );
    await page.reload();
    const settings = page.getByRole('navigation', { name: 'Settings' });
    await page.getByTestId('settings-trigger').click();
    await expect(settings).toHaveAttribute('data-state', 'collapsed');
    await page.getByTestId('settings-trigger').click();
    await expect(settings).toHaveAttribute('data-state', 'expanded');
    expect(
      JSON.parse((await page.evaluate(() => localStorage.getItem('fixture-settings')))!),
    ).toEqual({ start: { open: true }, end: { open: false, width: 20 } });
  });

  test('a remembered width beyond the bounds is kept within them', async ({ page }) => {
    await open(page, sidebars, 'fixture-settings');
    await page.evaluate(() =>
      localStorage.setItem(
        'fixture-settings',
        JSON.stringify({ start: { open: true, width: 90 } }),
      ),
    );
    await page.reload();
    const handle = page
      .getByRole('navigation', { name: 'Settings' })
      .getByRole('separator', { name: 'Resize sidebar' });
    await expect(handle).toHaveAttribute('aria-valuenow', '512');
    await expect(handle).toHaveAttribute('aria-valuetext', '32 rem');
  });

  test('a cookie read without initialState hydrates without a mismatch', async ({ page }) => {
    const hydrate = await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {Sidebar, SidebarTrigger} from '@envsemble/envui';
      export const element = h(Sidebar.Provider, {persist: {key: 'cookie-frame', storage: 'cookie'}},
        h(SidebarTrigger, {'data-testid': 'trigger'}),
        h(Sidebar.Root, {label: 'Cookie sidebar'}, h(Sidebar.Content, null, 'Content')));`,
      { hydrate: true },
    );
    await page.evaluate(() => (document.cookie = 'cookie-frame=start.open%3D0; path=/'));
    const sidebar = page.getByRole('navigation', { name: 'Cookie sidebar' });
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    expect(await hydrate()).toEqual([]);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  });
});

test.describe('A trigger whose sidebar had nothing to toggle', () => {
  test.use({ viewport: { width: 1100, height: 700 } });

  const frame = (sidebar: string) =>
    `import {createElement as h, useState} from 'react';
    import {AppShell, Sidebar, SidebarTrigger} from '@envsemble/envui';
    function Frame() {
      const [rail, setRail] = useState(false);
      return h(AppShell.Root, null,
        h(AppShell.Header, {start: h(SidebarTrigger, {'data-testid': 'trigger'})},
          h('button', {type: 'button', onClick: () => setRail(true)}, 'Make it a rail'),
          h(SidebarTrigger, {'data-testid': 'shown', hidden: false})),
        ${sidebar},
        h(AppShell.Main, null, 'Page'));
    }
    export const element = h(Frame);`;

  for (const [name, sidebar] of [
    [
      'shows again when its collapsible changes from none to rail',
      `h(Sidebar.Root, {label: 'Primary', collapsible: rail ? 'rail' : 'none'},
        h(Sidebar.Content, null, 'Content'))`,
    ],
    [
      'shows again when a rail sidebar takes the place of one on the same side',
      `rail
        ? h(Sidebar.Root, {key: 'rail', label: 'Rail'}, h(Sidebar.Content, null, 'Content'))
        : h(Sidebar.Root, {key: 'fixed', label: 'Fixed', collapsible: 'none'},
            h(Sidebar.Content, null, 'Content'))`,
    ],
  ] as const)
    test(`it ${name}`, async ({ page }) => {
      const hydrate = await openServerMarkup(page, frame(sidebar), { hydrate: true });
      const trigger = page.getByTestId('trigger');
      await expect(trigger).toBeHidden();
      expect(await hydrate()).toEqual([]);
      await expect(trigger).toBeHidden();
      // hidden={false} keeps a trigger shown even with nothing to toggle.
      await expect(page.getByTestId('shown')).toBeVisible();
      await page.getByRole('button', { name: 'Make it a rail' }).click();
      await expect(trigger).toBeVisible();
      await expect(page.getByTestId('shown')).toBeVisible();
      const expanded = await trigger.getAttribute('aria-expanded');
      await trigger.click();
      await expect(trigger).toHaveAttribute(
        'aria-expanded',
        expanded === 'true' ? 'false' : 'true',
      );
    });
});

test.describe('Before hydration', () => {
  test.use({ javaScriptEnabled: false });

  const order = ['sm', 'md', 'lg', 'xl'] as const;
  const widths = { sm: 640, md: 768, lg: 1024, xl: 1280 };
  const pairs = order.flatMap((breakpoint, index) =>
    order.slice(index + 1).map((dockAt) => ({ breakpoint, dockAt })),
  );

  test('a sidebar is a rail between the breakpoint and dockAt, for every pair', async ({
    page,
  }) => {
    await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {Sidebar} from '@envsemble/envui';
      const pairs = ${JSON.stringify(pairs)};
      export const element = h('div', null, pairs.map(({breakpoint, dockAt}) =>
        h(Sidebar.Provider, {key: breakpoint + dockAt, breakpoint},
          h(Sidebar.Root, {label: breakpoint + ' to ' + dockAt, dockAt},
            h(Sidebar.Content, null, 'A long sidebar item')))));`,
    );
    for (const { breakpoint, dockAt } of pairs) {
      const panel = page
        .getByRole('navigation', { name: `${breakpoint} to ${dockAt}` })
        .locator('.env-sidebar-panel');
      await page.setViewportSize({ width: widths[breakpoint] + 16, height: 600 });
      expect((await box(panel)).width, `${breakpoint} to ${dockAt}, below dockAt`).toBeLessThan(80);
      await page.setViewportSize({ width: widths[dockAt] + 16, height: 600 });
      expect((await box(panel)).width, `${breakpoint} to ${dockAt}, at dockAt`).toBeGreaterThan(
        150,
      );
    }
  });

  test('a trigger controls its sidebar, and hides where it has nothing to toggle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 600 });
    await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {AppShell, Sidebar, SidebarTrigger} from '@envsemble/envui';
      export const element = h(AppShell.Root, null,
        h(AppShell.Header, {start: h(SidebarTrigger, {'data-testid': 'trigger'})}),
        h(Sidebar.Root, {label: 'Fixed', collapsible: 'none'}, h(Sidebar.Content, null, 'Content')),
        h(AppShell.Main, null, 'Page'));`,
    );
    const trigger = page.getByTestId('trigger');
    const id = await page.getByRole('navigation', { name: 'Fixed' }).getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-controls', id!);
    await expect(trigger).toBeHidden();
    // Below the breakpoint it opens the drawer.
    await page.setViewportSize({ width: 500, height: 600 });
    await expect(trigger).toBeVisible();
  });

  test('a sidebar with a provider of its own in a title-bar frame is no part of the title bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 600 });
    await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {AppShell, Sidebar} from '@envsemble/envui';
      const header = (name) => h(Sidebar.Header, {'data-testid': name}, name);
      export const element = h(AppShell.Root, {titleBar: true, headerSpan: 'full'},
        h(AppShell.Header, null, 'Title'),
        h(Sidebar.Root, {label: 'Frame'}, header('frame-header')),
        h(AppShell.Main, null,
          h(Sidebar.Provider, null, h(Sidebar.Root, {label: 'Own'}, header('own-header'))),
          h(Sidebar.Root, {label: 'Alone'}, header('alone-header'))));`,
    );
    await expect(page.getByTestId('frame-header')).toHaveAttribute('data-title-bar', '');
    await expect(page.getByTestId('own-header')).not.toHaveAttribute('data-title-bar');
    await expect(page.getByTestId('alone-header')).not.toHaveAttribute('data-title-bar');
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
    // Opened from the keyboard, as a press doesn't focus a button in WebKit.
    await header.getByRole('button', { name: 'Open navigation' }).focus();
    await page.keyboard.press('Enter');
    const navigation = page.getByRole('dialog', { name: 'Primary' });
    await expect.poll(async () => Math.round((await box(navigation)).x)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(header.getByRole('button', { name: 'Open navigation' })).toBeFocused();
    await header.getByRole('button', { name: 'Open Directory' }).click();
    const directory = page.getByRole('dialog', { name: 'Directory' });
    await expect
      .poll(async () => Math.round((await box(directory)).x + (await box(directory)).width))
      .toBe(390);
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
    await handle.focus();
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '192');
    await expect(handle).toHaveAttribute('aria-valuetext', '12 rem');
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '208');
    await expect(handle).toHaveAttribute('aria-valuetext', '13 rem');
    await expect.poll(async () => (await box(settings)).width).toBeCloseTo(208, 0);
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
    await expect(handle).toHaveAttribute('aria-valuetext', 'Collapsed');
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

  test("on a sidebar that isn't resizable its value is only expanded or collapsed", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(sidebars);
    const filters = page.getByRole('navigation', { name: 'Filters', includeHidden: true });
    const handle = filters.getByRole('separator', { name: 'Filters' });
    await expect(handle).toHaveAttribute('aria-valuetext', 'Expanded');
    await expect(handle).toHaveAttribute('aria-controls', 'filters');
    await handle.focus();
    await page.keyboard.press('Enter');
    await expect(filters).toHaveAttribute('data-state', 'collapsed');
    const collapsed = filters.getByRole('separator', { includeHidden: true });
    await expect(collapsed).toHaveAttribute('aria-valuetext', 'Collapsed');
    await expect(collapsed).toHaveAttribute('aria-label', 'Filters');
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

  test('a second sidebar on a side gives the side back to the first as it goes', async ({
    page,
  }) => {
    await page.goto(`${sidebars}&duplicate`);
    const trigger = page.getByTestId('filters-trigger');
    await expect(trigger).toHaveAttribute('aria-controls', 'extra-filters');
    await page.getByRole('button', { name: 'Remove extra filters' }).click();
    await expect(trigger).toHaveAttribute('aria-controls', 'filters');
  });

  test('an off-canvas sidebar leaves the page out of view and inert, and focus with it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(sidebars);
    const filters = page.getByRole('navigation', { name: 'Filters', includeHidden: true });
    const trigger = page.getByTestId('filters-trigger');
    await filters.getByRole('button', { name: 'Only mine' }).focus();
    // A press that leaves focus inside, as a press doesn't focus a button in every engine.
    await trigger.dispatchEvent('click');
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

test.describe('Several Sidebar.Content sections', () => {
  test.use({ viewport: { width: 1280, height: 500 } });

  /** A frame whose sidebar holds a 64 px block above a long section, the middle one fill or not. */
  const frame = (fill: boolean) =>
    `import {createElement as h} from 'react';
    import {AppShell, Sidebar} from '@envsemble/envui';
    const items = Array.from({length: 60}, (_, index) => h('p', {key: index}, 'Item ' + index));
    export const element = h(AppShell.Root, null,
      h(Sidebar.Root, {label: 'Sections', collapsible: 'none'},
        h(Sidebar.Content, {align: 'stretch', 'data-testid': 'search'},
          h('div', {style: {blockSize: '64px'}, 'data-testid': 'block'})),
        h(Sidebar.Content, {fill: ${fill}, 'data-testid': 'long'}, items),
        ${fill ? "h(Sidebar.Content, {'data-testid': 'after'}, 'After')" : 'null'}),
      h(AppShell.Main, null, 'Main'));`;

  for (const fill of [false, true])
    test(`those before the last keep their size; the ${fill ? 'fill' : 'last'} one scrolls`, async ({
      page,
    }) => {
      await openServerMarkup(page, frame(fill));
      expect((await box(page.getByTestId('block'))).height).toBe(64);
      const search = page.getByTestId('search');
      expect(await search.evaluate((element) => element.scrollHeight - element.clientHeight)).toBe(
        0,
      );
      const long = page.getByTestId('long');
      expect(
        await long.evaluate((element) => element.scrollHeight > element.clientHeight + 100),
      ).toBe(true);
      const panel = await box(page.locator('.env-sidebar-panel'));
      expect((await box(long)).y + (await box(long)).height).toBeLessThanOrEqual(
        panel.y + panel.height + 0.5,
      );
      if (fill) {
        const after = page.getByTestId('after');
        await expect(after).toBeVisible();
        expect(await after.evaluate((element) => element.scrollHeight - element.clientHeight)).toBe(
          0,
        );
      }
    });
});
