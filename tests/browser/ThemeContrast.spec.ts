import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { cssColor, pairs } from '../contrast/Pairs';
import { themes } from '../contrast/Themes';

/** Every color the contrast gate measures, by name, as CSS. */
const colors = Object.fromEntries(
  [...new Set(pairs.flatMap((pair) => [pair.fg, ...pair.bg]))].map((name) => [
    name,
    cssColor(name),
  ]),
);

type Colors = Record<string, string>;

/** The colors as the browser resolves them inside an element. */
function colorsIn(target: Locator): Promise<Colors> {
  return target.evaluate((element, colors) => {
    const probe = document.createElement('span');
    probe.hidden = true;
    element.append(probe);
    const resolved: Record<string, string> = {};
    for (const [name, value] of Object.entries(colors)) {
      probe.style.color = value;
      resolved[name] = getComputedStyle(probe).color;
    }
    probe.remove();
    return resolved;
  }, colors);
}

/**
 * The colors of each theme the contrast gate measures, read as the gate reads them: in a boundary
 * with the theme's attributes. Read them while the page has no contrast preference.
 */
async function gateColors(page: Page): Promise<Record<string, Colors>> {
  const measured: Record<string, Colors> = {};
  for (const theme of themes) {
    measured[theme.name] = await page.evaluate(
      ({ attributes, colors }) => {
        const boundary = document.createElement('div');
        boundary.className = 'env-theme';
        for (const [name, value] of Object.entries(attributes)) boundary.setAttribute(name, value);
        const probe = document.createElement('span');
        boundary.append(probe);
        document.body.append(boundary);
        const resolved: Record<string, string> = {};
        for (const [name, value] of Object.entries(colors)) {
          probe.style.color = value;
          resolved[name] = getComputedStyle(probe).color;
        }
        boundary.remove();
        return resolved;
      },
      { attributes: theme.attributes, colors },
    );
  }
  expect(measured['light-high-contrast']).not.toEqual(measured.light);
  expect(measured['dark-high-contrast']).not.toEqual(measured.dark);
  return measured;
}

/** Sets the system's contrast preference and loads the page again: Firefox restyles only on load. */
async function preferContrast(page: Page, contrast: 'more' | 'no-preference') {
  await page.emulateMedia({ contrast });
  await page.reload();
}

// Each test opens every kind of popup from several boundaries, which takes longer than one.
test.describe.configure({ timeout: 120_000 });

/** Every kind of popup envUI portals, each of which the fixture opens from every boundary. */
const popupKinds = [
  'menu',
  'compact menu',
  'context menu',
  'menubar menu',
  'select',
  'compact select',
  'combobox',
  'date picker',
  'popover',
  'hover card',
  'tooltip',
  'dialog',
  'side panel',
  'command palette',
  'toast',
] as const;
type PopupKind = (typeof popupKinds)[number];

/** The element that draws a popup's surface: its fill, edge and shadow. */
const popupSurfaces =
  '.env-menu, .env-popover, .env-dropdown-options, .env-tooltip, .env-hover-card, .env-dialog-surface, .env-command-palette, .env-toast';

/** Opens one popup of a boundary of the fixture and returns it. */
async function open(page: Page, kind: PopupKind, name: string): Promise<Locator> {
  const button = (label: string) => page.getByRole('button', { name: label, exact: true });
  const dialog = (label: string) => page.getByRole('dialog', { name: label, exact: true });
  switch (kind) {
    case 'menu':
      await button(`Menu ${name}`).click();
      return page.getByRole('menu', { name: `Actions ${name}`, exact: true });
    case 'compact menu':
      await button(`Compact menu ${name}`).click();
      return page.getByRole('menu', { name: `Compact actions ${name}`, exact: true });
    case 'context menu':
      await page.getByText(`Context ${name}`, { exact: true }).click({ button: 'right' });
      return page.getByRole('menu', { name: `Context actions ${name}`, exact: true });
    case 'menubar menu':
      await page.getByRole('menuitem', { name: `File ${name}`, exact: true }).click();
      return page.getByRole('menu', { name: `File ${name}`, exact: true });
    case 'select':
      await page.getByRole('combobox', { name: `Status ${name}`, exact: true }).click();
      return page.getByRole('listbox');
    case 'compact select':
      await page.getByRole('combobox', { name: `Sort ${name}`, exact: true }).click();
      return page.getByRole('listbox');
    case 'combobox': {
      const field = page.getByRole('combobox', { name: `Person ${name}`, exact: true });
      // The floating label covers an empty field, so the keyboard opens its list.
      await field.focus();
      await field.press('ArrowDown');
      return page.getByRole('listbox');
    }
    case 'date picker':
      await page.getByRole('combobox', { name: `Due ${name}`, exact: true }).click();
      return dialog(`Due ${name}`);
    case 'popover':
      await button(`Popover ${name}`).click();
      return dialog(`Details ${name}`);
    case 'hover card':
      await page.getByRole('link', { name: `Card ${name}`, exact: true }).hover();
      return page.locator('.env-hover-card', { hasText: `Card ${name} details.` });
    case 'tooltip':
      await button(`Tooltip ${name}`).hover();
      return page.locator('.env-tooltip', { hasText: `Tooltip ${name}` });
    case 'dialog':
      await button(`Dialog ${name}`).click();
      return dialog(`Dialog ${name}`);
    case 'side panel':
      await button(`Panel ${name}`).click();
      return dialog(`Panel ${name}`);
    case 'command palette':
      await button(`Palette ${name}`).click();
      return dialog(`Palette ${name}`);
    case 'toast':
      await button(`Toast ${name}`).click();
      return page.locator('.env-toast', { hasText: `Toast ${name}` });
  }
}

/** Closes a popup that open() opened, and waits until it is gone. */
async function close(page: Page, kind: PopupKind, popup: Locator) {
  if (kind === 'tooltip' || kind === 'hover card') await page.mouse.move(0, 0);
  else if (kind === 'toast')
    await popup.getByRole('button', { name: 'Dismiss notification' }).click();
  else await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
}

/**
 * Opens each popup of a boundary and checks the Theme around its portal: its attributes, and that
 * every color the gate measures resolves there as in the expected theme.
 */
async function expectPopups(
  page: Page,
  name: string,
  expected: { theme: string; contrast: string | null; colors: Colors },
) {
  const boundary = page.getByTestId(`contrast-${name.replaceAll(' ', '-')}`);
  for (const kind of popupKinds) {
    const popup = await open(page, kind, name);
    await expect(popup).toBeVisible();
    const portal = popup.locator('xpath=ancestor::*[@data-env-theme][1]');
    expect(
      await portal.evaluate(
        (element, owner) => !owner!.contains(element),
        await boundary.elementHandle(),
      ),
      `${name} ${kind}: the popup renders in a portal`,
    ).toBe(true);
    await expect(portal).toHaveAttribute('data-env-theme', expected.theme);
    if (expected.contrast === null) await expect(portal).not.toHaveAttribute('data-env-contrast');
    else await expect(portal).toHaveAttribute('data-env-contrast', expected.contrast);
    expect(await colorsIn(portal), `${name} ${kind}: the popup's colors`).toEqual(expected.colors);
    await close(page, kind, popup);
  }
}

test.describe('theme contrast', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ contrast: 'no-preference' });
    await page.goto(`${fixtureUrl}/?fixture=theme-contrast`);
  });

  test('a high-contrast boundary opens its popups in high contrast', async ({ page }) => {
    const gate = await gateColors(page);
    const boundary = page.getByTestId('contrast-high');
    await expect(boundary).toHaveAttribute('data-env-contrast', 'high');
    expect(await colorsIn(boundary)).toEqual(gate['light-high-contrast']);
    await expectPopups(page, 'high', {
      theme: 'light',
      contrast: 'high',
      colors: gate['light-high-contrast'],
    });
  });

  test('a standard boundary keeps its popups standard while the system asks for more contrast', async ({
    page,
  }) => {
    const gate = await gateColors(page);
    await preferContrast(page, 'more');
    const boundary = page.getByTestId('contrast-standard');
    await expect(boundary).toHaveAttribute('data-env-contrast', 'standard');
    expect(await colorsIn(boundary)).toEqual(gate.light);
    await expectPopups(page, 'standard', {
      theme: 'light',
      contrast: 'standard',
      colors: gate.light,
    });
  });

  test('a nested Theme and its popups keep the contrast of the boundary around them', async ({
    page,
  }) => {
    const gate = await gateColors(page);
    await expect(page.getByTestId('contrast-nested-high')).toHaveAttribute(
      'data-env-contrast',
      'high',
    );
    await expectPopups(page, 'nested high', {
      theme: 'dark',
      contrast: 'high',
      colors: gate['dark-high-contrast'],
    });

    await preferContrast(page, 'more');
    await expect(page.getByTestId('contrast-nested-standard')).toHaveAttribute(
      'data-env-contrast',
      'standard',
    );
    await expectPopups(page, 'nested standard', {
      theme: 'dark',
      contrast: 'standard',
      colors: gate.dark,
    });
  });

  test('without a contrast, a boundary and its popups follow prefers-contrast: more', async ({
    page,
  }) => {
    const gate = await gateColors(page);
    const boundaries = [
      ['system', 'light'],
      ['system dark', 'dark'],
    ] as const;
    for (const [name, theme] of boundaries) {
      const boundary = page.getByTestId(`contrast-${name.replaceAll(' ', '-')}`);
      await expect(boundary).not.toHaveAttribute('data-env-contrast');
      expect(await colorsIn(boundary)).toEqual(gate[theme]);
      await expectPopups(page, name, { theme, contrast: null, colors: gate[theme] });
    }
    // The gate's high-contrast values reach the boundaries and their popups through the media query.
    await preferContrast(page, 'more');
    for (const [name, theme] of boundaries) {
      const boundary = page.getByTestId(`contrast-${name.replaceAll(' ', '-')}`);
      expect(await colorsIn(boundary)).toEqual(gate[`${theme}-high-contrast`]);
      await expectPopups(page, name, {
        theme,
        contrast: null,
        colors: gate[`${theme}-high-contrast`],
      });
    }
  });
});

test('ThemePreferenceProvider sets the contrast of the document root, its boundary and their popups', async ({
  page,
}) => {
  await page.emulateMedia({ contrast: 'no-preference' });
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast-provider`);
  const gate = await gateColors(page);
  const root = page.locator('html');
  const boundary = page.getByTestId('contrast-provider').locator('xpath=..');
  await expect(root).toHaveAttribute('data-env-theme', 'dark');
  await expect(root).toHaveAttribute('data-env-contrast', 'high');
  await expect(boundary).toHaveAttribute('data-env-contrast', 'high');
  expect(await colorsIn(root)).toEqual(gate['dark-high-contrast']);
  await expectPopups(page, 'provider', {
    theme: 'dark',
    contrast: 'high',
    colors: gate['dark-high-contrast'],
  });

  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect(root).not.toHaveAttribute('data-env-contrast');
  await expect(boundary).not.toHaveAttribute('data-env-contrast');
  expect(await colorsIn(root)).toEqual(gate.dark);
  await expectPopups(page, 'provider', { theme: 'dark', contrast: null, colors: gate.dark });
});

test('every popup keeps a visible edge under forced colors, where its shadow is gone', async ({
  page,
}) => {
  await page.emulateMedia({ contrast: 'no-preference', forcedColors: 'active' });
  await page.goto(`${fixtureUrl}/?fixture=theme-contrast`);
  for (const kind of popupKinds) {
    const popup = await open(page, kind, 'standard');
    await expect(popup).toBeVisible();
    const edge = await popup.evaluate((element, selector) => {
      const surface = element.closest(selector)!;
      const style = getComputedStyle(surface);
      // A panel at the edge of the window draws only the edge that faces the page.
      const side =
        ['top', 'left', 'right', 'bottom'].find(
          (each) => parseFloat(style.getPropertyValue(`border-${each}-width`)) >= 1,
        ) ?? 'top';
      const read = (part: string) => style.getPropertyValue(`border-${side}-${part}`);
      return {
        surface: surface.className,
        width: parseFloat(read('width')),
        style: read('style'),
        color: read('color'),
        background: style.backgroundColor,
      };
    }, popupSurfaces);
    expect(edge.width, `${kind} (${edge.surface}) has an edge`).toBeGreaterThanOrEqual(1);
    expect(edge.style, `${kind} draws its edge`).toBe('solid');
    expect(edge.color, `${kind}'s edge is painted`).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(edge.color, `${kind}'s edge differs from its fill`).not.toBe(edge.background);
    await close(page, kind, popup);
  }
});
