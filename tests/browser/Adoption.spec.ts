import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=adoption`;
const shellFixture = `${fixtureUrl}/?fixture=shell`;

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

for (const source of ['system', 'stored'] as const) {
  test(`the browser theme color follows the canvas of a ${source} dark theme`, async ({ page }) => {
    // The page starts with a static light theme color, as an application's index.html might.
    await page.emulateMedia({ colorScheme: source === 'system' ? 'dark' : 'light' });
    if (source === 'stored')
      await page.addInitScript(() => localStorage.setItem('fixture-theme', 'dark'));
    await page.goto(fixture);
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
  await page.goto(fixture);
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

test('a themed document root keeps the browser font size and its body the body type', async ({
  page,
}) => {
  await page.goto(fixture);
  const root = page.locator('html');
  await expect(root).toHaveClass(/env-theme/);
  // 1 rem stays the browser's 16 px, so rem measures keep their designed size.
  await expect(root).toHaveCSS('font-size', '16px');
  const button = page.getByTestId('router-button');
  await expect(button).toBeVisible();
  expect((await button.boundingBox())!.height).toBeCloseTo(40, 1);
  // Text takes the body type in the document body, the application and portals alike.
  await expect(page.locator('body')).toHaveCSS('font-size', '15px');
  await expect(page.locator('body')).toHaveCSS('line-height', '21px');
  await expect(page.locator('.fixture-adoption')).toHaveCSS('font-size', '15px');
  const portal = await page.evaluate(() => {
    const element = document.createElement('div');
    element.textContent = 'Another library’s popup';
    document.body.append(element);
    const { fontSize, fontFamily } = getComputedStyle(element);
    element.remove();
    return { fontSize, fontFamily };
  });
  expect(portal.fontSize).toBe('15px');
  expect(portal.fontFamily).toContain('envUI Inter');
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  await expect(dialog).toHaveCSS('font-size', '15px');
  await expect(dialog.getByRole('button', { name: 'Toggle pending' })).toHaveCSS('height', '40px');
});

test('an application body rule overrides the body type of a themed root', async ({ page }) => {
  await page.goto(fixture);
  await expect(page.locator('html')).toHaveClass(/env-theme/);
  // The application's style sheet comes first, so only specificity lets its plain body rule win.
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = 'body { font-size: 18px; line-height: 1.5; }';
    document.head.prepend(style);
  });
  await expect(page.locator('body')).toHaveCSS('font-size', '18px');
  await expect(page.locator('body')).toHaveCSS('line-height', '27px');
  await expect(page.locator('body')).toHaveCSS('font-family', /envUI Inter/);
  // The root keeps the browser's size, so rem measures keep theirs.
  await expect(page.locator('html')).toHaveCSS('font-size', '16px');
  await expect(page.getByTestId('router-button')).toHaveCSS('height', '40px');
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
  // The clear action uses the field's quiet icon color and shows a state layer on hover.
  const clear = page.getByRole('button', { name: 'Clear search' });
  await expect(clear).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const fieldIconColor = await clear.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-field-label)';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(clear).toHaveCSS('color', fieldIconColor);
  await clear.hover();
  await expect(clear).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await clear.click();
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
  await expect(
    page.getByRole('heading', { name: 'Products couldn’t load', level: 4 }),
  ).toBeVisible();
  // A whole-page state can take the top heading level without changing its look.
  const pageHeading = page.getByRole('heading', { name: 'Nothing here yet', level: 1 });
  await expect(pageHeading).toHaveClass(/env-text-section-heading/);
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
  // Floated onto the outline, the label hides only the line, not a box of field color above it.
  await expect(label).toHaveCSS('background-image', /linear-gradient/);
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(wellBox.y + 2);
  const button = page.getByTestId('compact-label-toolbar').getByRole('button', { name: 'Apply' });
  expect(Math.round(wellBox.height)).toBe(Math.round((await button.boundingBox())!.height));
});

test('a pending button keeps its size and name, reports busy and ignores presses', async ({
  page,
  browserName,
}) => {
  await page.goto(fixture);
  const button = page.getByTestId('pending-button');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button.locator('.env-spinner')).toBeVisible();
  await expect(button.locator('.env-button-content')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
  await button.click({ force: true });
  await expect(page.getByTestId('pending-presses')).toHaveText('0');
  await expect(page.getByRole('progressbar', { name: 'Refreshing seats' })).toBeVisible();
  if (browserName === 'chromium') {
    // The browser's own accessibility tree, which drops visually hidden text, still names it.
    const session = await page.context().newCDPSession(page);
    const { root } = await session.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '[data-testid="pending-button"]',
    });
    const { nodes } = await session.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    });
    expect(nodes[0].name?.value).toBe('Save changes');
  }
});

test('LoadingBar waits before appearing, then completes and leaves', async ({ page }) => {
  await page.goto(fixture);
  const toggle = page.getByRole('button', { name: 'Toggle loading' });
  const bar = page.getByRole('progressbar', { name: 'Loading next page' });
  // Record every state the bar renders, so short-lived states cannot slip between assertions.
  await page.evaluate(() => {
    const states: string[] = [];
    (window as unknown as { barStates: string[] }).barStates = states;
    new MutationObserver(() => {
      const element = document.querySelector('[aria-label="Loading next page"]');
      // After the bar has shown, its absence is recorded as "none".
      const state = element ? element.getAttribute('data-state')! : states.length ? 'none' : null;
      if (state && states.at(-1) !== state) states.push(state);
    }).observe(document.body, { subtree: true, childList: true, attributes: true });
  });
  const states = () =>
    page.evaluate(() => (window as unknown as { barStates: string[] }).barStates);
  // Quick work never shows the bar.
  await toggle.click();
  await toggle.click();
  await page.waitForTimeout(400);
  expect(await states()).toEqual([]);
  await toggle.click();
  await expect(bar).toHaveAttribute('data-state', 'running');
  await toggle.click();
  await expect(bar).toHaveCount(0);
  expect(await states()).toEqual(['running', 'finishing', 'none']);
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
  // A detail, such as the person's role, follows each name.
  await expect(
    menu.getByRole('menuitemradio', { name: 'Contoso Member', exact: true }),
  ).toBeVisible();
  await expect(menu.locator('.env-organization-menu-detail').first()).toHaveText('Admin');
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

test('ConfirmButton names the consequence and runs only on a deliberate second press', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-button');
  const confirmed = page.getByTestId('confirmed');
  const status = page.locator('.env-confirm-button-status').first();
  await expect(button).toHaveText('Remove');
  await expect(button).toHaveClass(/env-button-outlined/);

  await button.click();
  await expect(button).toHaveText('Remove Morgan?');
  await expect(button).toHaveClass(/env-button-destructive/);
  await expect(status).toHaveText('Remove Morgan? Press again to confirm.');
  await page.waitForTimeout(450);
  await button.click();
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveText('Remove');
  await expect(status).toHaveText('');

  // A double click only arms it.
  await button.dblclick();
  await expect(button).toHaveText('Remove Morgan?');
  await expect(confirmed).toHaveText('1');
  // Escape, leaving the button and waiting all disarm it.
  await button.press('Escape');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan?');
  await page.keyboard.press('Tab');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan?');
  await expect(button).toHaveText('Remove', { timeout: 3000 });
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('an icon-only ConfirmButton is round at rest and names the consequence when armed', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-icon-button');
  const confirmed = page.getByTestId('confirmed');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toHaveClass(/env-button-secondary/);
  const rest = (await button.boundingBox())!;
  expect(rest.width).toBeCloseTo(40, 0);
  expect(rest.height).toBeCloseTo(40, 0);
  // Round like IconButton: the corners take at least half the height.
  expect(
    await button.evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius)),
  ).toBeGreaterThanOrEqual(20);

  // Keyboard arming keeps focus on the button while it grows to name the consequence.
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAccessibleName('Remove Morgan?');
  await expect(button).toHaveText('Remove Morgan?');
  await expect(button).toHaveClass(/env-button-destructive/);
  await expect(button).not.toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();
  await expect(button.locator('.env-symbol')).toHaveCount(1);
  expect((await button.boundingBox())!.width).toBeGreaterThan(rest.width + 40);
  await expect(page.locator('.env-confirm-button-status').nth(1)).toHaveText(
    'Remove Morgan? Press again to confirm.',
  );
  await page.waitForTimeout(450);
  await page.keyboard.press('Enter');
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();

  await button.click();
  await expect(button).toHaveText('Remove Morgan?');
  await button.press('Escape');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('AnimatedNumber rolls up when a count grows and down when it shrinks', async ({ page }) => {
  await page.goto(fixture);
  const number = page.getByTestId('animated-number');
  const value = number.locator('.env-animated-number-value');
  await expect(number).toHaveText('3');
  await expect(value).not.toHaveAttribute('data-direction');
  await expect(page.getByRole('button', { name: 'Show 3 homes' })).toBeVisible();

  await page.getByRole('button', { name: 'More homes' }).click();
  await expect(number).toHaveText('4');
  await expect(value).toHaveAttribute('data-direction', 'up');
  await expect(value).toHaveCSS('animation-name', 'env-motion-roll-up');
  await page.getByRole('button', { name: 'Fewer homes' }).click();
  await page.getByRole('button', { name: 'Fewer homes' }).click();
  await expect(number).toHaveText('2');
  await expect(value).toHaveAttribute('data-direction', 'down');
  await expect(value).toHaveCSS('animation-name', 'env-motion-roll-down');

  // With reduced motion the new value only fades in.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'More homes' }).click();
  await expect(value).toHaveCSS('animation-name', 'env-motion-fade-in');
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

  test('the sidebar toggle is a secondary icon button while its icon shows', async ({ page }) => {
    await page.goto(shellFixture);
    const toggle = page.getByRole('button', { name: 'Collapse sidebar' });
    const token = (name: string) =>
      toggle.evaluate((element, variable) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = `var(${variable})`;
        element.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      }, name);
    await page.mouse.move(700, 500);
    await expect(toggle).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await toggle.hover();
    await expect(toggle).toHaveCSS(
      'background-color',
      await token('--color-secondary-action-hover'),
    );
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

test('direction links, radio rows and choice controls settle while pressed', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=colors`);
  // The choice controls shrink, not their labels, whether the control or its text is pressed.
  const targets = [
    {
      press: page.getByTestId('light-color-direction'),
      moves: page.getByTestId('light-color-direction'),
    },
    {
      press: page.getByTestId('light-color-radio-row').locator('.env-radio-option'),
      moves: page.getByTestId('light-color-radio-row').locator('.env-radio-option'),
    },
    {
      press: page.getByText('light isolated checkbox'),
      moves: page.getByTestId('light-color-checkbox').locator('xpath=..'),
    },
    {
      press: page.getByText('light isolated switch'),
      moves: page.getByTestId('light-color-switch'),
    },
  ];
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const { press, moves } of targets) {
      await press.hover();
      await page.mouse.down();
      if (reducedMotion === 'reduce') await expect(moves).toHaveCSS('transform', 'none');
      else await expect(moves).not.toHaveCSS('transform', 'none');
      await page.mouse.up();
      await page.mouse.move(0, 0);
    }
  }
});
