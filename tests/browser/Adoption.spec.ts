import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
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

test('an application body rule styles the body, while envUI keeps its type inside its boundaries', async ({
  page,
}) => {
  await page.goto(fixture);
  await expect(page.locator('html')).toHaveClass(/env-theme/);
  const body = page.locator('body');
  const inside = [
    page.getByTestId('adoption-plain-text'),
    page.getByTestId('adoption-paragraph'),
    page.getByTestId('adoption-nested-theme'),
  ];
  // A rule inside a cascade layer loses to envUI's unlayered style sheet, whatever its specificity.
  const layered = await page.evaluateHandle(() => {
    const style = document.createElement('style');
    style.textContent = '@layer application { body { font-size: 18px; } }';
    document.head.prepend(style);
    return style;
  });
  await expect(body).toHaveCSS('font-size', '15px');
  await layered.evaluate((style) => style.remove());
  // An application's unlayered body rule, before envUI's style sheet, styles the body itself.
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent =
      'body { font-family: "Fixture Serif"; font-size: 18px; line-height: 27px; }';
    document.head.prepend(style);
  });
  await expect(body).toHaveCSS('font-family', /Fixture Serif/);
  await expect(body).toHaveCSS('font-size', '18px');
  await expect(body).toHaveCSS('line-height', '27px');
  // Inside the provider's boundary, text, paragraphs and a Theme around content keep envUI's type,
  // and so do the components and the popups, each in a boundary of its own.
  for (const element of [...inside, page.getByTestId('router-button')]) {
    await expect(element).toHaveCSS('font-family', /envUI Inter/);
    await expect(element).not.toHaveCSS('font-size', '18px');
  }
  for (const element of inside) {
    await expect(element).toHaveCSS('font-size', '15px');
    await expect(element).toHaveCSS('line-height', '21px');
  }
  await page.getByRole('button', { name: 'Assign seat' }).hover();
  const tooltip = page.locator('.env-tooltip');
  await expect(tooltip).toHaveText('All seats are assigned');
  await expect(tooltip).toHaveCSS('font-family', /envUI Inter/);
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Open pending dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  await expect(dialog).toHaveCSS('font-family', /envUI Inter/);
  await expect(dialog).toHaveCSS('font-size', '15px');
  // envUI's font tokens change its typeface wherever it applies.
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '.env-theme { --font-family: "Fixture Serif", serif; }';
    document.head.append(style);
  });
  await expect(page.getByTestId('adoption-paragraph')).toHaveCSS('font-family', /^"?Fixture Serif/);
  await expect(dialog).toHaveCSS('font-family', /^"?Fixture Serif/);
  // Text in another size inside a boundary keeps its lines in proportion to it.
  const large = await page.getByTestId('adoption-plain-text').evaluateHandle((element) => {
    const text = document.createElement('div');
    text.textContent = 'A larger line';
    text.style.fontSize = '2rem';
    element.after(text);
    return text;
  });
  expect(
    Number.parseFloat(await large.evaluate((element) => getComputedStyle(element).lineHeight)),
  ).toBeCloseTo(44.8, 1);
  // --line-height-body sets the boundary's line height.
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '.env-theme { --line-height-body: 2; }';
    document.head.append(style);
  });
  await expect(page.getByTestId('adoption-plain-text')).toHaveCSS('line-height', '30px');
  // The root keeps the browser's size, so rem measures keep theirs.
  await expect(page.locator('html')).toHaveCSS('font-size', '16px');
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

test('Tooltip keeps opening on hover after its control is enabled or disabled', async ({
  page,
}) => {
  await page.goto(fixture);
  const invite = page.getByRole('button', { name: 'Invite member' });
  const toggle = page.getByRole('button', { name: 'Toggle seats' });
  await toggle.click();
  await expect(invite).toBeDisabled();
  await page.locator('.env-tooltip-disabled-target').filter({ has: invite }).hover();
  await expect(page.locator('.env-tooltip')).toHaveText('No seats left');
  await page.mouse.move(1, 1);
  await expect(page.locator('.env-tooltip')).toHaveCount(0);
  // Enabled again, the control itself is the trigger, and hovering it opens the tooltip.
  await toggle.click();
  await expect(invite).toBeEnabled();
  await invite.hover();
  await expect(page.locator('.env-tooltip')).toHaveText('Invite a member');
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

test('OrganizationSwitcher switches organizations and offers creating one', async ({ page }) => {
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
  await expect(menu.locator('.env-organization-switcher-detail').first()).toHaveText('Admin');
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

  test('focus that scrolls the document lands below the topbar, not under it', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto(shellFixture);
    // Far down a long page, a focusable region nearly as tall as the window, such as a table's
    // scroll region, with a control at its top.
    await page.locator('.env-app-content').evaluate((content) => {
      const spacer = () =>
        Object.assign(document.createElement('div'), { style: 'height: 1200px' });
      const before = Object.assign(document.createElement('button'), { textContent: 'Before' });
      const region = Object.assign(document.createElement('div'), { tabIndex: 0 });
      region.setAttribute('data-testid', 'tall-region');
      region.style.height = '620px';
      const action = Object.assign(document.createElement('button'), { textContent: 'Sort' });
      region.append(action);
      content.append(spacer(), before, spacer(), region, spacer());
    });
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    const below = topbar.y + topbar.height;
    const region = page.getByTestId('tall-region');
    const action = region.getByRole('button', { name: 'Sort' });
    await page.getByRole('button', { name: 'Before' }).focus();
    // Tabbing to the region, below the window, scrolls it into the window below the topbar, so its
    // top is not under it.
    await page.keyboard.press('Tab');
    await expect(region).toBeFocused();
    expect((await region.boundingBox())!.y).toBeGreaterThanOrEqual(below);
    // A control left under the topbar scrolls out from under it as it takes focus.
    await action.evaluate((element) =>
      window.scrollBy(0, element.getBoundingClientRect().top - 10),
    );
    expect((await action.boundingBox())!.y).toBeLessThan(below);
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    expect((await action.boundingBox())!.y).toBeGreaterThanOrEqual(below);
  });

  test('the topbar scroll padding gives way to the application and holds for every shell', async ({
    page,
  }) => {
    await page.goto(shellFixture);
    const html = page.locator('html');
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    await expect(html).toHaveCSS('scroll-padding-top', `${topbar.height + 8}px`);
    // It comes from a style rule, never from a style written on the document element.
    expect(
      await html.evaluate((element) =>
        element.style.getPropertyValue('scroll-padding-block-start'),
      ),
    ).toBe('');
    // Scroll padding the application sets inline on the document wins.
    await html.evaluate((element) =>
      element.style.setProperty('scroll-padding-block-start', '123px'),
    );
    await expect(html).toHaveCSS('scroll-padding-top', '123px');
    await html.evaluate((element) => element.style.removeProperty('scroll-padding-block-start'));
    // So does a style sheet that loads after the shell.
    const late = await page.evaluateHandle(() => {
      const style = document.createElement('style');
      style.textContent = 'html { scroll-padding-top: 90px; }';
      document.head.append(style);
      return style;
    });
    await expect(html).toHaveCSS('scroll-padding-top', '90px');
    await late.evaluate((style) => style.remove());
    // And so does a rule in one of the application's cascade layers, declared after envUI's.
    const layered = await page.evaluateHandle(() => {
      const style = document.createElement('style');
      style.textContent = '@layer utilities { html { scroll-padding-top: 6rem; } }';
      document.head.append(style);
      return style;
    });
    await expect(html).toHaveCSS('scroll-padding-top', '96px');
    await layered.evaluate((style) => style.remove());
    await expect(html).toHaveCSS('scroll-padding-top', `${topbar.height + 8}px`);
  });

  test('several shells keep the padding for the tallest topbar that shows', async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=two-shells`);
    const html = page.locator('html');
    const size = () =>
      html.evaluate((element) => element.style.getPropertyValue('--env-app-topbar-block-size'));
    // The second shell's topbar is 5 rem tall, the first one's 3.25 rem.
    await expect.poll(size).toBe('80px');
    await expect(html).toHaveCSS('scroll-padding-top', '88px');
    await page.getByRole('button', { name: 'Hide the second shell' }).click();
    await expect.poll(size).toBe('52px');
    await expect(html).toHaveCSS('scroll-padding-top', '60px');
    await page.getByRole('button', { name: 'Show the second shell' }).click();
    await expect.poll(size).toBe('80px');
    await expect(html).toHaveCSS('scroll-padding-top', '88px');
    await page.getByRole('button', { name: 'Remove the second shell' }).click();
    await expect.poll(size).toBe('52px');
    await expect(html).toHaveCSS('scroll-padding-top', '60px');
    // A shell hidden on its own keeps nothing clear but the margin.
    await page.getByRole('button', { name: 'Hide the first shell' }).click();
    await expect.poll(size).toBe('0px');
    await expect(html).toHaveCSS('scroll-padding-top', '8px');
  });

  test('the scroll padding follows the topbar however tall it is', async ({ page }) => {
    await page.goto(shellFixture);
    const html = page.locator('html');
    const topbar = page.locator('.env-app-topbar');
    await expect(html).toHaveCSS('scroll-padding-top', '60px');
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '.env-theme { --topbar-height: 5rem; }';
      document.head.append(style);
    });
    await expect.poll(async () => (await topbar.boundingBox())!.height).toBeCloseTo(80, 0);
    await expect(html).toHaveCSS('scroll-padding-top', '88px');
  });

  test.describe('server-rendered', () => {
    test.use({ javaScriptEnabled: false });

    test('an anchor in the address lands below the topbar from the first paint', async ({
      page,
    }) => {
      // Markup as a server renders it, before any script runs.
      const stylesheet = `/@fs/${resolve('packages/ui/src/styles/index.css').replaceAll('\\', '/')}?direct`;
      await page.route('**/server-rendered-shell.html', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<!doctype html><html lang="en"><head><link rel="stylesheet" href="${stylesheet}"></head><body><div class="env-theme" data-env-theme="light"><div class="env-app-shell"><header class="env-app-topbar">Topbar</header><main class="env-app-content"><div style="height: 1500px"></div><h2 id="later-section">Later section</h2><div style="height: 1500px"></div></main></div></div></body></html>`,
        }),
      );
      await page.goto(`${fixtureUrl}/server-rendered-shell.html#later-section`);
      const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
      expect(topbar.height).toBeGreaterThan(40);
      await expect
        .poll(async () => (await page.locator('#later-section').boundingBox())!.y)
        .toBeGreaterThanOrEqual(topbar.y + topbar.height);
    });
  });

  test('an anchor target lands below the topbar', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto(shellFixture);
    await page.locator('.env-app-content').evaluate((content) => {
      const spacer = () =>
        Object.assign(document.createElement('div'), { style: 'height: 1500px' });
      const target = Object.assign(document.createElement('h2'), {
        id: 'later-section',
        textContent: 'Later section',
      });
      content.append(spacer(), target, spacer());
    });
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    await page.evaluate(() => (location.hash = '#later-section'));
    await expect
      .poll(async () => (await page.locator('#later-section').boundingBox())!.y)
      .toBeGreaterThanOrEqual(topbar.y + topbar.height);
  });

  test('a shell whose topbar is the title bar leaves the document without scroll padding', async ({
    page,
  }) => {
    await page.goto(`${fixtureUrl}/?fixture=full-shell`);
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-title-bar', '');
    await expect(page.locator('html')).toHaveCSS('scroll-padding-top', 'auto');
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
      .poll(() => fillContrast(row.getByRole('button', { name: 'Remove' }), '.env-list-item'))
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
