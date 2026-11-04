import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const affixes = `${fixtureUrl}/?fixture=affixes`;
const adoption = `${fixtureUrl}/?fixture=adoption`;

const themes = ['light', 'dark'] as const;

/**
 * Opens a fixture once its web font is in: the tests compare the boxes of the text, which the font
 * moves when it arrives after the page has loaded, as on a busy machine.
 */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(async () => {
    // Loaded by name, so the wait holds even before the fixture has rendered any text.
    await document.fonts.load('1em "envUI Geist"');
    await document.fonts.ready;
  });
}

/** Where an element's text is painted, without its padding. */
async function textBox(element: Locator) {
  return element.evaluate((node) => {
    const range = node.ownerDocument.createRange();
    range.selectNodeContents(node);
    const { x, y, width, height } = range.getBoundingClientRect();
    return { x, y, width, height };
  });
}

/** The prefix or suffix of the field around a control. */
const affix = (control: Locator, part: 'prefix' | 'suffix') =>
  control.locator(`xpath=..`).locator(`.env-text-field-${part}`);

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('a prefix shows with the value inside the field and is read with it', async ({ page }) => {
  await open(page, affixes);
  const scope = page.getByTestId('affixes-light');
  const address = scope.getByRole('textbox', { name: 'Address', exact: true });
  await expect(address).toHaveAccessibleDescription('https://example.com/');
  const prefix = affix(address, 'prefix');
  await expect(prefix).toHaveText('https://example.com/');
  await expect(prefix).toHaveAttribute('aria-hidden', 'true');
  // While the label rests in the empty field, the prefix waits for focus or a value.
  await expect(prefix).toHaveCSS('opacity', '0');
  await address.focus();
  await expect(prefix).toHaveCSS('opacity', '1');
  await page.keyboard.type('tokens');
  await expect(address).toHaveValue('tokens');
  await address.blur();
  await expect(prefix).toHaveCSS('opacity', '1');
  // The value starts right after the prefix, on the same line.
  const prefixBox = (await prefix.boundingBox())!;
  const addressBox = (await address.boundingBox())!;
  expect(addressBox.x).toBeCloseTo(prefixBox.x + prefixBox.width, 0);
  const center = (box: { y: number; height: number }) => box.y + box.height / 2;
  expect(Math.abs(center(prefixBox) - center(addressBox))).toBeLessThan(1);
  // Pressing the prefix places the caret in the field.
  await address.blur();
  await prefix.click();
  await expect(address).toBeFocused();
  expect(await address.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(0);

  await scope.getByRole('button', { name: 'Submit affixes' }).click();
  await expect(page.getByTestId('affixes-submitted-light')).toContainText('slug=tokens');
  await expect(page.getByTestId('affixes-submitted-light')).toContainText('size=2');
});

test('a suffix follows the value and keeps the hint and error in the description', async ({
  page,
}) => {
  await open(page, affixes);
  const scope = page.getByTestId('affixes-light');
  const size = scope.getByRole('spinbutton', { name: 'Size', exact: true });
  await expect(size).toHaveAccessibleDescription('MB Up to 10');
  const suffix = affix(size, 'suffix');
  await expect(suffix).toHaveCSS('opacity', '1');
  const well = size.locator('xpath=..');
  const suffixBox = (await suffix.boundingBox())!;
  const suffixText = await textBox(suffix);
  const wellBox = (await well.boundingBox())!;
  const sizeBox = (await size.boundingBox())!;
  expect(suffixBox.x).toBeGreaterThanOrEqual(sizeBox.x + sizeBox.width - 1);
  // The suffix keeps the field's inline padding from the outline.
  expect(wellBox.x + wellBox.width - (suffixText.x + suffixText.width)).toBeCloseTo(17, 0);
  await suffix.click();
  await expect(size).toBeFocused();

  const limit = scope.getByRole('textbox', { name: 'Limit' });
  await expect(limit).toHaveAttribute('aria-invalid', 'true');
  await expect(limit).toHaveAccessibleDescription('items Use 1 or more.');
  await expect(affix(limit, 'suffix')).toHaveText('items');

  const quota = scope.getByRole('textbox', { name: 'Quota' });
  await expect(quota).toBeDisabled();
  await expect(affix(quota, 'suffix')).toBeVisible();
  await expect(quota.locator('xpath=..')).toHaveCSS('opacity', '0.48');
  // Pressing the suffix of a disabled field leaves focus where it is.
  await affix(quota, 'suffix').click();
  await expect(quota).not.toBeFocused();
});

test('compact fields hold a prefix and suffix between the icon and the end action', async ({
  page,
}) => {
  await open(page, affixes);
  const scope = page.getByTestId('affixes-light');
  const price = scope.getByRole('textbox', { name: 'Price', exact: true });
  await expect(price).toHaveAccessibleDescription('€ per month');
  const well = price.locator('xpath=..');
  await expect(well).toHaveCSS('height', '40px');
  const icon = (await well.locator('.env-text-field-start .env-icon').boundingBox())!;
  const prefix = (await affix(price, 'prefix').boundingBox())!;
  const prefixText = await textBox(affix(price, 'prefix'));
  const input = (await price.boundingBox())!;
  const suffix = (await affix(price, 'suffix').boundingBox())!;
  const suffixText = await textBox(affix(price, 'suffix'));
  const action = (await scope.getByRole('button', { name: 'Copy price' }).boundingBox())!;
  // A hidden label leaves the prefix visible beside the placeholder.
  await expect(affix(price, 'prefix')).toHaveCSS('opacity', '1');
  // Icon, prefix, value, suffix and action follow each other without overlapping.
  expect(prefixText.x).toBeGreaterThan(icon.x + icon.width);
  expect(input.x).toBeGreaterThanOrEqual(prefix.x + prefix.width - 1);
  expect(suffix.x).toBeGreaterThanOrEqual(input.x + input.width - 1);
  expect(action.x).toBeGreaterThanOrEqual(suffixText.x + suffixText.width);
  const center = (box: { y: number; height: number }) => box.y + box.height / 2;
  expect(Math.abs(center(prefix) - center(input))).toBeLessThan(1);
  expect(Math.abs(center(suffix) - center(input))).toBeLessThan(1);

  const share = scope.getByRole('textbox', { name: 'Share', exact: true });
  await expect(share.locator('xpath=..')).toHaveCSS('height', '40px');
  await expect(affix(share, 'suffix')).toHaveCSS('opacity', '1');

  const handle = scope.getByRole('textbox', { name: 'Handle', exact: true });
  const handlePrefix = (await affix(handle, 'prefix').boundingBox())!;
  const handleWell = (await handle.locator('xpath=..').boundingBox())!;
  // A floating field's prefix starts at its well's edge, its padding inside it, as an outline field's.
  expect(Math.abs(handlePrefix.x - handleWell.x)).toBeLessThanOrEqual(1);
});

test('a long prefix is cut short so the value keeps its room', async ({ page }) => {
  await open(page, affixes);
  const link = page.getByTestId('affixes-light').getByRole('textbox', { name: 'Link' });
  const prefix = affix(link, 'prefix');
  await expect(prefix).toHaveCSS('text-overflow', 'ellipsis');
  expect(await prefix.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  const well = (await link.locator('xpath=..').boundingBox())!;
  const input = (await link.boundingBox())!;
  expect(input.width).toBeGreaterThanOrEqual(Math.min(96, well.width / 2) - 1);
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const narrow = (await link.boundingBox())!;
  expect(narrow.width).toBeGreaterThanOrEqual(95);
});

test('a quiet field is only its text at rest, takes a soft fill on hover and focus, and clears its placeholder once focused', async ({
  page,
}) => {
  await open(page, affixes);
  for (const theme of themes) {
    const field = page
      .getByTestId(`affixes-${theme}`)
      .getByRole('searchbox', { name: 'Find projects' });
    const well = field.locator('xpath=..');
    const look = () =>
      well.evaluate((element) => {
        const style = getComputedStyle(element);
        const input = element.querySelector('input')!;
        return {
          border: getComputedStyle(element.querySelector('.env-text-field-border')!).borderTopColor,
          fill: style.backgroundColor,
          placeholder: getComputedStyle(input, '::placeholder').color,
        };
      });
    await page.mouse.move(0, 0);
    const rest = await look();
    expect(rest.border).toBe('rgba(0, 0, 0, 0)');
    expect(rest.fill).toBe('rgba(0, 0, 0, 0)');
    expect(rest.placeholder).not.toBe('rgba(0, 0, 0, 0)');
    await field.hover();
    await expect.poll(async () => (await look()).fill).not.toBe('rgba(0, 0, 0, 0)');
    expect((await look()).border).toBe('rgba(0, 0, 0, 0)');
    await field.focus();
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await look()).placeholder).toBe('rgba(0, 0, 0, 0)');
    expect((await look()).fill).not.toBe('rgba(0, 0, 0, 0)');
    await field.blur();
  }
});

test('SearchField clears with its button and with Escape inside a dialog', async ({ page }) => {
  await open(page, adoption);
  const search = page.getByRole('searchbox', { name: 'Search members' });
  await expect(search).toHaveAttribute('placeholder', 'Search by name');
  await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0);
  await search.fill('alex');
  // The clear action uses the field's quiet icon color and shows a state layer on hover.
  const clear = page.getByRole('button', { name: 'Clear search' });
  await expect(clear).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const fieldIconColor = await clear.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--env-color-fg-muted)';
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

test('compact fields can float their label into the outline and keep the button height', async ({
  page,
}) => {
  await open(page, adoption);
  const field = page.getByTestId('compact-label');
  const well = field.locator('xpath=..');
  const label = well.locator('label');
  await expect(label).toBeVisible();
  const resting = (await label.boundingBox())!;
  const wellBox = (await well.boundingBox())!;
  expect(resting.y).toBeGreaterThan(wellBox.y);
  await field.fill('Northwind');
  // Floated onto the outline, the label has no fill: the border opens behind it instead.
  await expect(label).toHaveCSS('background-image', 'none');
  await expect(label).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect
    .poll(() =>
      well
        .locator(':scope > .env-text-field-border legend')
        .evaluate((legend) => legend.clientWidth),
    )
    .toBeGreaterThan(0);
  await expect.poll(async () => (await label.boundingBox())!.y).toBeLessThan(wellBox.y + 2);
  const button = page.getByTestId('compact-label-toolbar').getByRole('button', { name: 'Apply' });
  expect(Math.round(wellBox.height)).toBe(Math.round((await button.boundingBox())!.height));
});

test('an outline field has no fill of its own, and its floated label cuts a notch in the border', async ({
  page,
}) => {
  await open(page, affixes);
  const field = page.getByTestId('affixes-dark').getByRole('textbox', { name: 'Address' });
  const control = field.locator('xpath=..');
  const border = control.locator(':scope > .env-text-field-border');
  const notch = () =>
    border.locator('legend').evaluate((legend) => legend.getBoundingClientRect().width);
  // It takes the background of what it sits on, and the fieldset over its edge draws the border.
  await expect(control).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(control).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(border).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(border).toHaveAttribute('aria-hidden', 'true');
  expect(await notch()).toBe(0);
  // Focused, the label floats into the border, which opens behind it as wide as the label.
  await field.focus();
  const label = control.locator(':scope > label');
  await expect
    .poll(async () => Math.abs((await notch()) - (await label.boundingBox())!.width))
    .toBeLessThanOrEqual(1);
  const [labelBox, notchBox] = [
    (await label.boundingBox())!,
    (await border.locator('legend').boundingBox())!,
  ];
  expect(Math.abs(labelBox.x - notchBox.x)).toBeLessThanOrEqual(1);
  // The notch starts where the pill's curve has all but flattened, within a quarter rem of its end,
  // so the edge doesn't end in a hook.
  const controlBox = (await control.boundingBox())!;
  const radius = Math.min(
    parseFloat(await control.evaluate((element) => getComputedStyle(element).borderTopLeftRadius)),
    controlBox.height / 2,
  );
  expect(notchBox.x - controlBox.x).toBeGreaterThanOrEqual(radius - 4);
});

test('right to left, the floated label cuts its notch under itself, with a start icon too', async ({
  page,
}) => {
  await open(page, affixes);
  for (const name of ['Street', 'City']) {
    const field = page.getByTestId('affixes-light').getByRole('textbox', { name });
    const control = field.locator('xpath=..');
    const label = control.locator(':scope > label');
    const legend = control.locator(':scope > .env-text-field-border legend');
    await field.focus();
    await expect
      .poll(async () =>
        Math.abs((await legend.boundingBox())!.width - (await label.boundingBox())!.width),
      )
      .toBeLessThanOrEqual(1);
    const [labelBox, notchBox] = [(await label.boundingBox())!, (await legend.boundingBox())!];
    // The notch starts at the right, where the label does.
    expect(
      Math.abs(labelBox.x + labelBox.width - (notchBox.x + notchBox.width)),
    ).toBeLessThanOrEqual(1);
  }
});
