import { afterEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as provider from '../fixture/ThemeContrastProvider.fixture.tsx';
import * as nested from '../fixture/ThemeContrastNested.fixture.tsx';
import * as remount from '../fixture/ThemeContrastRemount.fixture.tsx';
import * as release from '../fixture/ThemeRelease.fixture.tsx';
import * as controlled from '../fixture/ThemePreferenceControlled.fixture.tsx';
import { collectErrors, css, nextFrames } from './support/Browser.ts';
import { mount, unmount } from './support/Mount.tsx';

const root = document.documentElement;
const attribute = (name: string) => () => root.getAttribute(name);

function arrivesWith(attributes: Record<string, string>) {
  for (const [name, value] of Object.entries(attributes)) root.setAttribute(name, value);
}

afterEach(() => {
  unmount();
  for (const name of root.getAttributeNames())
    if (name.startsWith('data-env-')) root.removeAttribute(name);
  root.classList.remove('env-theme');
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.remove();
});

const toggle = () => page.getByTestId('theme-toggle');
const otherTheme = () => (root.getAttribute('data-env-theme') === 'dark' ? 'light' : 'dark');

function expectRootLook() {
  const boundary = document.querySelector('.fixture-adoption')!;
  expect(boundary.classList.contains('env-theme')).toBe(false);
  expect(boundary.hasAttribute('data-env-scale')).toBe(false);
  expect(boundary.hasAttribute('data-env-contrast')).toBe(false);
  for (const name of ['--env-control-height-md', '--env-color-fg-default'])
    expect(css(boundary, name), name).toBe(css(root, name));
}
const nestedTheme = (name: string) => () =>
  page.getByTestId('adoption-nested-theme').element().getAttribute(name);

test('a provider without a contrast leaves the contrast the page set on the root, and gives it to the application', async () => {
  for (const contrast of ['standard', 'high'] as const) {
    arrivesWith({ 'data-env-contrast': contrast });
    mount(adoption);
    await expect.element(toggle()).toBeVisible();
    expect(attribute('data-env-contrast')()).toBe(contrast);
    expectRootLook();
    expect(nestedTheme('data-env-contrast')()).toBe(contrast);
    const after = otherTheme();
    await toggle().click();
    await expect.poll(attribute('data-env-theme')).toBe(after);
    expect(attribute('data-env-contrast')()).toBe(contrast);
    expect(root.hasAttribute('data-env-contrast-source')).toBe(false);
    unmount();
    root.removeAttribute('data-env-contrast');
  }
});

test('a provider removes or replaces the contrast envUI wrote before it', async () => {
  arrivesWith({ 'data-env-contrast': 'high', 'data-env-contrast-source': 'envui:high' });
  mount(adoption);
  await expect.element(toggle()).toBeVisible();
  await expect.poll(() => root.hasAttribute('data-env-contrast')).toBe(false);
  expect(root.hasAttribute('data-env-contrast-source')).toBe(false);
  unmount();

  arrivesWith({ 'data-env-contrast': 'standard', 'data-env-contrast-source': 'envui:standard' });
  mount(provider);
  await expect.poll(attribute('data-env-contrast')).toBe('high');
  expect(attribute('data-env-contrast-source')()).toBe('envui:high');
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect.poll(() => root.hasAttribute('data-env-contrast')).toBe(false);
  unmount();

  mount(remount);
  await expect.poll(attribute('data-env-contrast')).toBe('high');
  await page.getByRole('button', { name: 'Switch to the second user' }).click();
  await expect.poll(() => root.hasAttribute('data-env-contrast')).toBe(false);
  expect(root.hasAttribute('data-env-contrast-source')).toBe(false);
});

test('a provider leaves a contrast the application wrote over its own, also the same one once it removed the marker', async () => {
  mount(provider);
  await expect.poll(attribute('data-env-contrast')).toBe('high');
  root.setAttribute('data-env-contrast', 'standard');
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await expect.poll(() => root.hasAttribute('data-env-contrast-source')).toBe(false);
  expect(attribute('data-env-contrast')()).toBe('standard');
  unmount();
  root.removeAttribute('data-env-contrast');

  mount(provider);
  await expect.poll(attribute('data-env-contrast')).toBe('high');
  root.setAttribute('data-env-contrast', 'high');
  root.removeAttribute('data-env-contrast-source');
  await page.getByRole('button', { name: 'Follow the system contrast' }).click();
  await nextFrames();
  expect(attribute('data-env-contrast')()).toBe('high');
});

test(
  'a provider at system leaves the contrast another mounted provider wrote',
  { tags: ['once'] },
  async () => {
    const errors = collectErrors();
    mount(nested);
    await expect.poll(attribute('data-env-contrast')).toBe('high');
    const after = otherTheme();
    await page.getByTestId('inner-theme-toggle').click();
    await expect.poll(attribute('data-env-theme')).toBe(after);
    expect(attribute('data-env-contrast')()).toBe('high');
    expect(attribute('data-env-scale')()).toBe('compact');
    expect(attribute('data-env-scale-source')()).toBe('envui:compact');
    expect(errors.filter((error) => error.includes('applyToDocument={false}'))).toHaveLength(1);
  },
);

test('a provider without a scale leaves the scale the page set on the root, and gives it to the application', async () => {
  arrivesWith({ 'data-env-scale': 'compact' });
  mount(adoption);
  await expect.element(toggle()).toBeVisible();
  await toggle().click();
  expect(attribute('data-env-scale')()).toBe('compact');
  expect(root.hasAttribute('data-env-scale-source')).toBe(false);
  expectRootLook();
  expect(nestedTheme('data-env-scale')()).toBe('compact');
  await page.getByRole('button', { name: 'Open account menu' }).click();
  const menu = page.getByRole('menu', { name: 'Account' });
  await expect.element(menu).toBeVisible();
  expect(menu.element().closest('.env-theme')!.getAttribute('data-env-scale')).toBe('compact');
  expect(root.hasAttribute('data-env-scale-source')).toBe(false);
  root.setAttribute('data-env-scale', 'comfortable');
  await expect.poll(nestedTheme('data-env-scale')).toBe('comfortable');
  expectRootLook();
});

test('a provider without a scale removes the scale envUI wrote on the root, and leaves one the page wrote over it', async () => {
  arrivesWith({ 'data-env-scale': 'compact', 'data-env-scale-source': 'envui:compact' });
  mount(adoption);
  await expect.element(toggle()).toBeVisible();
  await expect.poll(() => root.hasAttribute('data-env-scale')).toBe(false);
  expect(root.hasAttribute('data-env-scale-source')).toBe(false);
  expect(nestedTheme('data-env-scale')()).toBe('system');
  expectRootLook();
  unmount();

  arrivesWith({ 'data-env-scale': 'comfortable', 'data-env-scale-source': 'envui:compact' });
  mount(adoption);
  await expect.element(toggle()).toBeVisible();
  await expect.poll(() => root.hasAttribute('data-env-scale-source')).toBe(false);
  expect(attribute('data-env-scale')()).toBe('comfortable');
});

test('a provider releases the root scale, contrast and look once it stops applying to the document or unmounts, and leaves those the page wrote over its own', async () => {
  const released = () =>
    [
      'data-env-contrast',
      'data-env-contrast-source',
      'data-env-scale',
      'data-env-scale-source',
      'data-env-selection',
      'data-env-corners',
    ].filter((name) => root.hasAttribute(name));
  mount(release);
  await expect.poll(attribute('data-env-contrast')).toBe('high');
  expect(attribute('data-env-scale')()).toBe('compact');
  expect(attribute('data-env-selection')()).toBe('accent');
  expect(attribute('data-env-corners')()).toBe('sharp');
  const token = (name: string) => getComputedStyle(root).getPropertyValue(name);
  expect(token('--env-color-bg-selected')).toBe(token('--env-color-bg-selected-accent'));
  expect(token('--env-color-fg-on-selected')).toBe(token('--env-color-fg-on-selected-accent'));
  expect(token('--env-radius-sm')).toBe('0.125rem');
  await page.getByRole('button', { name: 'Stop applying to the document' }).click();
  await expect.poll(released).toEqual([]);
  expect(document.querySelector('.fixture-main')!.getAttribute('data-env-scale')).toBe('compact');
  unmount();

  mount(release);
  await expect.poll(attribute('data-env-scale')).toBe('compact');
  await page.getByRole('button', { name: 'Unmount the provider' }).click();
  await expect.poll(() => page.getByText('Provider content').elements().length).toBe(0);
  await expect.poll(released).toEqual([]);
  unmount();

  mount(release);
  await expect.poll(attribute('data-env-scale')).toBe('compact');
  root.setAttribute('data-env-scale', 'comfortable');
  root.setAttribute('data-env-contrast', 'standard');
  await page.getByRole('button', { name: 'Unmount the provider' }).click();
  await expect.poll(() => page.getByText('Provider content').elements().length).toBe(0);
  expect(attribute('data-env-scale')()).toBe('comfortable');
  expect(attribute('data-env-contrast')()).toBe('standard');
  expect(released()).toEqual(['data-env-contrast', 'data-env-scale']);
});

test(
  'a theme chosen in another window of the same origin applies here',
  { tags: ['engines'] },
  async () => {
    mount(adoption);
    await expect.element(toggle()).toBeVisible();
    const after = otherTheme();
    localStorage.setItem('fixture-theme', after);
    const stored = (newValue: string | null) =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'fixture-theme', newValue, storageArea: localStorage }),
      );
    stored(after);
    await expect.poll(attribute('data-env-theme')).toBe(after);
    await expect
      .element(toggle())
      .toHaveAccessibleName(`Switch to ${after === 'dark' ? 'light' : 'dark'} theme`);

    localStorage.removeItem('fixture-theme');
    stored(null);
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    await expect.poll(attribute('data-env-theme')).toBe(system);
  },
);

test('a provider given its preference shows it, reports what people choose and keeps nothing in the browser', async () => {
  localStorage.clear();
  mount(controlled);
  await expect.poll(attribute('data-env-theme')).toBe('dark');
  await toggle().click();
  await expect.element(page.getByTestId('preference')).toHaveTextContent('light');
  await expect.poll(attribute('data-env-theme')).toBe('light');
  await page.getByRole('button', { name: "Take the account's theme" }).click();
  await expect.poll(attribute('data-env-theme')).toBe('dark');
  await expect.element(toggle()).toHaveAccessibleName('Switch to light theme');
  expect(localStorage.length).toBe(0);
});

test('useStoredThemePreference stores the choice, and the provider themes the document root', async () => {
  const fixture = mount(adoption);
  await expect.element(toggle()).toBeVisible();
  const after = otherTheme();
  await toggle().click();
  await expect.poll(attribute('data-env-theme')).toBe(after);
  expect(root.classList.contains('env-theme')).toBe(true);
  expect(localStorage.getItem('fixture-theme')).toBe(after);
  fixture.remount();
  await expect.poll(attribute('data-env-theme')).toBe(after);
  await expect
    .element(toggle())
    .toHaveAccessibleName(`Switch to ${after === 'dark' ? 'light' : 'dark'} theme`);
});

test('the browser theme color follows the canvas of the resolved theme, a system or a stored dark one', async () => {
  const staticColor = () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#ffffff';
    document.head.append(meta);
  };
  const metas = () => [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')];
  const canvas = () => getComputedStyle(root).backgroundColor;
  for (const source of ['system', 'stored'] as const) {
    staticColor();
    await commands.emulateMedia({ colorScheme: source === 'system' ? 'dark' : 'light' });
    if (source === 'stored') localStorage.setItem('fixture-theme', 'dark');
    mount(adoption);
    await expect.poll(attribute('data-env-theme'), { message: source }).toBe('dark');
    expect(canvas(), source).not.toBe('rgb(255, 255, 255)');
    await expect.poll(() => metas()[0]!.content, { message: source }).toBe(canvas());
    unmount();
    localStorage.clear();
    for (const meta of metas()) meta.remove();
  }

  staticColor();
  await commands.emulateMedia({ colorScheme: 'dark' });
  mount(adoption);
  await expect.poll(attribute('data-env-theme')).toBe('dark');
  const dark = canvas();
  await expect.poll(() => metas()[0]!.content).toBe(dark);
  const scheme = document.createElement('meta');
  scheme.name = 'theme-color';
  scheme.media = '(prefers-color-scheme: dark)';
  scheme.content = '#000000';
  document.head.append(scheme);
  await toggle().click();
  await expect.poll(attribute('data-env-theme')).toBe('light');
  const light = canvas();
  expect(metas()).toHaveLength(2);
  await expect.poll(() => metas().map((meta) => meta.content)).toEqual([light, light]);
  await toggle().click();
  await expect.poll(() => metas().map((meta) => meta.content)).toEqual([dark, dark]);
});
