import { afterEach, beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as affixes from '../fixture/Affixes.fixture.tsx';
import type { FixtureModule } from '../fixture/FixtureMount.tsx';
import { box, collectErrors, css, keyboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

let errors: string[] = [];

beforeEach(() => {
  errors = collectErrors();
});

afterEach(() => {
  expect(errors).toEqual([]);
});

/**
 * Mounts a fixture once its web font is in: the tests compare the boxes of the text, which the font
 * moves when it arrives after the page has loaded, as on a busy machine.
 */
async function open(module: FixtureModule) {
  mount(module);
  // Loaded by name, so the wait holds even before the fixture has rendered any text.
  await document.fonts.load('1em "envUI Geist"');
  await document.fonts.ready;
}

/** Where an element's text is painted, without its padding. */
function textBox(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const { x, y, width, height } = range.getBoundingClientRect();
  return { x, y, width, height };
}

/** The well around a control, and its prefix or suffix. */
const well = (control: Locator) => control.element().parentElement!;
const affix = (control: Locator, part: 'prefix' | 'suffix') =>
  well(control).querySelector<HTMLElement>(`.env-text-field-${part}`)!;
const center = (rect: { y: number; height: number }) => rect.y + rect.height / 2;

test('affixes sit beside the value, a press on one places the caret, and a long prefix is cut short', async () => {
  await open(affixes);
  const scope = page.getByTestId('affixes-light');
  const address = scope.getByRole('textbox', { name: 'Address', exact: true });
  const prefix = affix(address, 'prefix');
  expect(css(prefix, 'opacity')).toBe('1');
  (address.element() as HTMLElement).focus();
  await keyboard.type('tokens');
  await expect.element(address).toHaveValue('tokens');
  (address.element() as HTMLElement).blur();
  // The value starts right after the prefix, on the same line.
  const [prefixBox, addressBox] = [box(prefix), box(address)];
  expect(addressBox.x).toBeCloseTo(prefixBox.x + prefixBox.width, 0);
  expect(Math.abs(center(prefixBox) - center(addressBox))).toBeLessThan(1);
  // Pressing the prefix places the caret in the field.
  await page.elementLocator(prefix).click();
  await expect.element(address).toHaveFocus();
  expect((address.element() as HTMLInputElement).selectionStart).toBe(0);
  await scope.getByRole('button', { name: 'Submit affixes' }).click();
  const submitted = () =>
    page.getByTestId('affixes-submitted-light').element().textContent!.split(' ');
  await expect.poll(submitted).toContain('slug=tokens');
  expect(submitted()).toContain('size=2');

  // A suffix follows the value and keeps the field's inline padding from the outline.
  const size = scope.getByRole('spinbutton', { name: 'Size', exact: true });
  const suffix = affix(size, 'suffix');
  expect(css(suffix, 'opacity')).toBe('1');
  expect(box(suffix).x).toBeGreaterThanOrEqual(box(size).x + box(size).width - 1);
  const wellBox = box(well(size));
  const suffixText = textBox(suffix);
  expect(wellBox.x + wellBox.width - (suffixText.x + suffixText.width)).toBeCloseTo(17, 0);
  await page.elementLocator(suffix).click();
  await expect.element(size).toHaveFocus();
  // A disabled field doesn't fade as a whole: its value and suffix take the disabled text color.
  const quota = scope.getByRole('textbox', { name: 'Quota' });
  expect(css(well(quota), 'opacity')).toBe('1');
  const probe = document.createElement('span');
  probe.style.color = 'var(--env-color-fg-disabled)';
  well(quota).append(probe);
  const colors = [
    css(well(quota).querySelector('.env-text-field-input')!, 'color'),
    css(affix(quota, 'suffix'), 'color'),
    css(probe, 'color'),
  ];
  probe.remove();
  expect(new Set(colors).size).toBe(1);
  // Pressing the suffix of a disabled field leaves focus where it is.
  await page.elementLocator(affix(quota, 'suffix')).click();
  await expect.element(quota).not.toHaveFocus();

  // Compact fields hold a prefix and suffix between the icon and the end action.
  const price = scope.getByRole('textbox', { name: 'Price', exact: true });
  expect(css(well(price), 'height')).toBe('40px');
  const icon = box(well(price).querySelector('.env-text-field-start .env-icon')!);
  const pricePrefix = box(affix(price, 'prefix'));
  const prefixText = textBox(affix(price, 'prefix'));
  const input = box(price);
  const priceSuffix = box(affix(price, 'suffix'));
  const priceSuffixText = textBox(affix(price, 'suffix'));
  const action = box(scope.getByRole('button', { name: 'Copy price' }));
  // A hidden label leaves the prefix visible beside the placeholder.
  expect(css(affix(price, 'prefix'), 'opacity')).toBe('1');
  // Icon, prefix, value, suffix and action follow each other without overlapping.
  expect(prefixText.x).toBeGreaterThan(icon.x + icon.width);
  expect(input.x).toBeGreaterThanOrEqual(pricePrefix.x + pricePrefix.width - 1);
  expect(priceSuffix.x).toBeGreaterThanOrEqual(input.x + input.width - 1);
  expect(action.x).toBeGreaterThanOrEqual(priceSuffixText.x + priceSuffixText.width);
  expect(Math.abs(center(pricePrefix) - center(input))).toBeLessThan(1);
  expect(Math.abs(center(priceSuffix) - center(input))).toBeLessThan(1);
  const share = scope.getByRole('textbox', { name: 'Share', exact: true });
  expect(css(well(share), 'height')).toBe('40px');
  expect(css(affix(share, 'suffix'), 'opacity')).toBe('1');
  // A large field's prefix starts at its well's edge, its padding inside it, as a medium field's.
  const handle = scope.getByRole('textbox', { name: 'Handle', exact: true });
  expect(Math.abs(box(affix(handle, 'prefix')).x - box(well(handle)).x)).toBeLessThanOrEqual(1);

  // A long prefix is cut short so the value keeps its room.
  const link = scope.getByRole('textbox', { name: 'Link' });
  const long = affix(link, 'prefix');
  expect(css(long, 'text-overflow')).toBe('ellipsis');
  expect(long.scrollWidth > long.clientWidth).toBe(true);
  expect(box(link).width).toBeGreaterThanOrEqual(Math.min(96, box(well(link)).width / 2) - 1);
  await page.viewport(390, 900);
  expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
  expect(box(link).width).toBeGreaterThanOrEqual(95);
});

test('SearchField clears with its button and with Escape inside a dialog', async () => {
  await open(adoption);
  const search = page.getByRole('searchbox', { name: 'Search members' });
  await expect.element(search).toHaveAttribute('placeholder', 'Search by name');
  const clear = page.getByRole('button', { name: 'Clear search' });
  expect(clear.elements()).toHaveLength(0);
  await search.fill('alex');
  await clear.click();
  await expect.element(search).toHaveValue('');
  await expect.element(search).toHaveFocus();
  const button = page.getByRole('button', { name: 'Open pending dialog' });
  // The whole field, not only its well, lines up with an adjacent button.
  const field = search.element().parentElement!.parentElement!;
  expect(Math.round(box(field).height)).toBe(Math.round(box(button).height));

  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Save project' });
  const inner = dialog.getByRole('searchbox', { name: 'Search inside dialog' });
  // With its label hidden and no placeholder of its own, a search field says Search.
  await expect.element(inner).toHaveAttribute('placeholder', 'Search');
  await inner.fill('draft');
  (inner.element() as HTMLElement).focus();
  await keyboard.press('Escape');
  await expect.element(inner).toHaveValue('');
  await expect.element(dialog).toBeVisible();
});

test('a field shows its label above its box, right to left too, and focus thickens its edge without a ring', async () => {
  await open(affixes);
  // Right to left, with and without a start icon, the label starts where the box does, above it.
  for (const name of ['Street', 'City']) {
    const field = page.getByTestId('affixes-light').getByRole('textbox', { name });
    const label = well(field).parentElement!.querySelector(':scope > label')!;
    const [labelBox, wellBox] = [box(label), box(well(field))];
    expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(wellBox.y);
    expect(Math.abs(labelBox.x + labelBox.width - (wellBox.x + wellBox.width))).toBeLessThanOrEqual(
      1,
    );
  }
  // A compact field keeps the button height, and focus draws its edge in the accent, twice as
  // thick, inward, with no ring around it.
  await open(adoption);
  const field = page.getByTestId('compact-label');
  const control = well(field);
  const wellBox = box(control);
  const apply = page.getByTestId('compact-label-toolbar').getByRole('button', { name: 'Apply' });
  expect(Math.round(wellBox.height)).toBe(Math.round(box(apply).height));
  const rest = css(control, 'border-top-color');
  expect(css(control, 'box-shadow')).toBe('none');
  (field.element() as HTMLElement).focus();
  await expect.poll(() => css(control, 'border-top-color')).not.toBe(rest);
  expect(css(control, 'box-shadow')).toContain('inset');
  expect(css(control, 'outline-style')).toBe('none');
  expect(box(control)).toEqual(wellBox);
});
