import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as contrastFixture from '../fixture/ThemeContrast.fixture.tsx';
import * as providerFixture from '../fixture/ThemeContrastProvider.fixture.tsx';
import { themes } from '../contrast/Themes.ts';
import { closePopup, openPopup, popupKinds, popupShown } from './Popups.ts';
import { mount } from './Mount.tsx';
import type { FixtureModule } from '../fixture/FixtureMount.tsx';

type Colors = Record<string, string>;

/** Every color the contrast gate measures, by name, as CSS. */
let colors: Colors;
beforeAll(async () => {
  colors = await commands.contrastColors();
});

/** The colors as the browser resolves them inside an element. */
function colorsIn(element: Element): Colors {
  const probe = document.createElement('span');
  probe.hidden = true;
  element.append(probe);
  const resolved: Colors = {};
  for (const [name, value] of Object.entries(colors)) {
    probe.style.color = value;
    resolved[name] = getComputedStyle(probe).color;
  }
  probe.remove();
  return resolved;
}

/**
 * The colors of each theme the contrast gate measures, read as the gate reads them: in a boundary
 * with the theme's attributes. Read them while the page has no contrast preference.
 */
function gateColors(): Record<string, Colors> {
  const measured: Record<string, Colors> = {};
  for (const theme of themes) {
    const boundary = document.createElement('div');
    boundary.className = 'env-theme';
    for (const [name, value] of Object.entries(theme.attributes))
      boundary.setAttribute(name, value);
    document.body.append(boundary);
    measured[theme.name] = colorsIn(boundary);
    boundary.remove();
  }
  expect(measured['light-high-contrast']).not.toEqual(measured.light);
  expect(measured['dark-high-contrast']).not.toEqual(measured.dark);
  return measured;
}

/** Sets the system's contrast preference and mounts the fixture again, as a page load would. */
async function preferContrast(
  contrast: 'more' | 'no-preference',
  module: FixtureModule = contrastFixture,
) {
  await commands.emulateMedia({ contrast });
  mount(module);
}

const boundaryOf = (name: string) =>
  page.getByTestId(`contrast-${name.replaceAll(' ', '-')}`).element();

/**
 * Opens each popup of a boundary and checks the Theme around its portal: its attributes, and that
 * every color the gate measures resolves there as in the expected theme.
 */
async function expectPopups(
  name: string,
  expected: { theme: string; contrast: string | null; colors: Colors },
) {
  const boundary = boundaryOf(name);
  for (const kind of popupKinds) {
    const popup = await openPopup(kind, name);
    await expect.poll(() => popupShown(popup), { message: `${name} ${kind} opens` }).toBe(true);
    const portal = popup()!.closest('[data-env-theme]')!;
    expect(boundary.contains(portal), `${name} ${kind}: the popup renders in a portal`).toBe(false);
    expect(portal.getAttribute('data-env-theme'), `${name} ${kind}`).toBe(expected.theme);
    expect(portal.getAttribute('data-env-contrast'), `${name} ${kind}`).toBe(expected.contrast);
    expect(colorsIn(portal), `${name} ${kind}: the popup's colors`).toEqual(expected.colors);
    await closePopup(kind, popup);
  }
}

describe('theme contrast', () => {
  beforeEach(async () => {
    await preferContrast('no-preference');
  });

  test('a high-contrast boundary opens its popups in high contrast, and a standard one keeps them standard while the system asks for more', async () => {
    const gate = gateColors();
    const high = boundaryOf('high');
    expect(high.getAttribute('data-env-contrast')).toBe('high');
    expect(colorsIn(high)).toEqual(gate['light-high-contrast']);
    await expectPopups('high', {
      theme: 'light',
      contrast: 'high',
      colors: gate['light-high-contrast']!,
    });

    await preferContrast('more');
    const standard = boundaryOf('standard');
    expect(standard.getAttribute('data-env-contrast')).toBe('standard');
    expect(colorsIn(standard)).toEqual(gate.light);
    await expectPopups('standard', { theme: 'light', contrast: 'standard', colors: gate.light! });
  });

  test('a nested Theme and its popups keep the contrast of the boundary around them', async () => {
    const gate = gateColors();
    expect(boundaryOf('nested high').getAttribute('data-env-contrast')).toBe('high');
    await expectPopups('nested high', {
      theme: 'dark',
      contrast: 'high',
      colors: gate['dark-high-contrast']!,
    });

    await preferContrast('more');
    expect(boundaryOf('nested standard').getAttribute('data-env-contrast')).toBe('standard');
    await expectPopups('nested standard', {
      theme: 'dark',
      contrast: 'standard',
      colors: gate.dark!,
    });
  });
});

test('ThemePreferenceProvider sets the contrast of the document root, its boundary and their popups', async () => {
  await preferContrast('no-preference', providerFixture);
  const gate = gateColors();
  const root = document.documentElement;
  const boundary = page.getByTestId('contrast-provider').element().parentElement!;
  await expect.poll(() => root.getAttribute('data-env-theme')).toBe('dark');
  expect(root.getAttribute('data-env-contrast')).toBe('high');
  // The boundary, outside any Theme, takes the root's look: no theme of its own.
  expect(boundary.hasAttribute('data-env-contrast')).toBe(false);
  expect(colorsIn(root)).toEqual(gate['dark-high-contrast']);
  expect(colorsIn(boundary)).toEqual(gate['dark-high-contrast']);
  await expectPopups('provider', {
    theme: 'dark',
    contrast: 'high',
    colors: gate['dark-high-contrast']!,
  });

  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect.poll(() => root.hasAttribute('data-env-contrast')).toBe(false);
  expect(colorsIn(root)).toEqual(gate.dark);
  expect(colorsIn(boundary)).toEqual(gate.dark);
  await expectPopups('provider', { theme: 'dark', contrast: null, colors: gate.dark! });
});
