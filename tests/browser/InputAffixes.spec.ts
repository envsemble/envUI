import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const themes = ['light', 'dark'] as const;

/** Text contrast as painted: the text color over every fill between it and the theme canvas. */
async function paintedContrast(element: Locator) {
  return element.evaluate((node) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const fills: string[] = [];
    for (let current: Element | null = node; current; current = current.parentElement) {
      fills.unshift(getComputedStyle(current).backgroundColor);
      if (current.classList.contains('env-theme')) break;
    }
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
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const background = paint(fills);
    const foreground = paint([...fills, getComputedStyle(node).color]);
    const [lighter, darker] = [background, foreground].sort((a, b) => b - a);
    return (lighter! + 0.05) / (darker! + 0.05);
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
  await page.goto(`${fixtureUrl}/?fixture=affixes`);
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('a prefix shows with the value inside the field and is read with it', async ({ page }) => {
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
  const scope = page.getByTestId('affixes-light');
  const price = scope.getByRole('textbox', { name: 'Price', exact: true });
  await expect(price).toHaveAccessibleDescription('€ per month');
  const well = price.locator('xpath=..');
  await expect(well).toHaveCSS('height', '40px');
  const icon = (await well.locator('.env-text-field-start .env-symbol').boundingBox())!;
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
  // Plain fields keep their text on the field's edge.
  expect(Math.abs(handlePrefix.x - handleWell.x)).toBeLessThanOrEqual(1);
});

test('a long prefix is cut short so the value keeps its room', async ({ page }) => {
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

test('prefix and suffix text keep 4.5:1 contrast in both themes', async ({ page }) => {
  for (const theme of themes) {
    const scope = page.getByTestId(`affixes-${theme}`);
    const parts = scope.locator('.env-text-field-prefix, .env-text-field-suffix');
    // Measure once every field has rendered: nine prefixes and suffixes in each theme.
    await expect(parts).toHaveCount(9);
    for (const part of await parts.all()) {
      const field = part.locator('xpath=ancestor::*[contains(@class, "env-text-field-well")][1]');
      if ((await field.locator('input:disabled').count()) > 0) continue;
      // The prefix of an empty field without focus is hidden behind its resting label.
      if ((await part.evaluate((element) => getComputedStyle(element).opacity)) === '0') continue;
      expect(await paintedContrast(part), `${theme} ${await part.textContent()}`).toBeGreaterThan(
        4.5,
      );
    }
  }
});
