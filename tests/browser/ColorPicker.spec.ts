import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=color-picker`;

/** Gives the page an eyedropper that picks `picked`, or takes the browser's away with null. */
async function eyeDropper(page: Page, picked: string | null) {
  await page.addInitScript((picked) => {
    if (picked === null) {
      delete (window as { EyeDropper?: unknown }).EyeDropper;
      return;
    }
    (window as { EyeDropper?: unknown }).EyeDropper = class {
      open() {
        return Promise.resolve({ sRGBHex: picked });
      }
    };
  }, picked);
}

const picker = (page: Page, name: string) =>
  page.getByTestId('color-picker').getByRole('group', { name, exact: true });

test('the area and the hue slider move the color with the keyboard', async ({ page }) => {
  await page.goto(fixture);
  const controlled = picker(page, 'Controlled color');
  const area = controlled.getByRole('slider', { name: 'Controlled color, Color picker' });
  const hex = controlled.getByRole('textbox', { name: 'Hex' });
  const last = page.getByTestId('color-last');
  await area.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(last).not.toHaveText('');
  const lessSaturated = await last.textContent();
  await expect(hex).toHaveValue(lessSaturated!.toUpperCase());
  // Up moves the brightness, the area's other channel.
  await page.keyboard.press('ArrowUp');
  await expect(last).not.toHaveText(lessSaturated!);
  // The thumb shows its focus ring while the keyboard moves it.
  const thumb = controlled.locator('.env-color-picker-area .env-color-picker-thumb');
  expect(await thumb.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  const hue = controlled.getByRole('slider', { name: 'Hue' });
  const before = Number(await hue.inputValue());
  await hue.focus();
  await page.keyboard.press('ArrowRight');
  await expect(hue).toHaveValue(String(before + 1));
  await page.keyboard.press('Home');
  await expect(hue).toHaveValue('0');
  await expect(hue).toHaveAttribute('aria-valuetext', /^0°/);
  await expect(hex).toHaveValue(/^#[0-9A-F]{6}$/);
  await expect(page.getByTestId('color-changes')).toHaveText('4');
});

test('each format types the color in its own fields', async ({ page }) => {
  await page.goto(fixture);
  const controlled = picker(page, 'Controlled color');
  const last = page.getByTestId('color-last');
  const hex = controlled.getByRole('textbox', { name: 'Hex' });
  await hex.fill('ff8800');
  await hex.press('Enter');
  await expect(last).toHaveText('#ff8800');
  await expect(hex).toHaveValue('#FF8800');
  // A draft that is no color goes back to the color as focus leaves.
  await hex.fill('#12');
  await hex.blur();
  await expect(hex).toHaveValue('#FF8800');
  await expect(page.getByTestId('color-changes')).toHaveText('1');

  await controlled.getByRole('combobox', { name: 'Color format' }).click();
  await page.getByRole('option', { name: 'RGB' }).click();
  const red = controlled.getByRole('textbox', { name: 'Red' });
  await expect(red).toHaveValue('255');
  await expect(controlled.getByRole('textbox', { name: 'Blue' })).toHaveValue('0');
  await red.fill('16');
  await red.press('Enter');
  await expect(last).toHaveText('#108800');
  // The arrow keys step a channel.
  await red.press('ArrowUp');
  await expect(last).toHaveText('#118800');

  await controlled.getByRole('combobox', { name: 'Color format' }).click();
  await page.getByRole('option', { name: 'HSL' }).click();
  const lightness = controlled.getByRole('textbox', { name: 'Lightness' });
  await expect(controlled.getByRole('textbox', { name: 'Hue' })).toBeVisible();
  await lightness.fill('50');
  await lightness.press('Enter');
  await expect(controlled.getByRole('textbox', { name: 'Lightness' })).toHaveValue('50%');
  await expect(controlled.getByRole('textbox', { name: 'Hex' })).toHaveCount(0);
});

test('alpha has a slider and a field, and values keep it while translucent', async ({ page }) => {
  await page.goto(fixture);
  const translucent = picker(page, 'Translucent color');
  const output = page.getByTestId('color-translucent');
  const alpha = translucent.getByRole('textbox', { name: 'Alpha' });
  await expect(alpha).toHaveValue('50%');
  await alpha.fill('25');
  await alpha.press('Enter');
  await expect(output).toHaveText('rgba(103, 80, 164, 0.25)');
  const slider = translucent.getByRole('slider', { name: 'Alpha' });
  await slider.focus();
  await page.keyboard.press('End');
  // Fully opaque, the value drops its alpha.
  await expect(output).toHaveText('rgb(103, 80, 164)');
  await expect(alpha).toHaveValue('100%');
  // A preset keeps its own alpha; the arrow keys move between presets, and Enter chooses.
  const swatches = translucent.getByRole('listbox', { name: 'Swatches' });
  await swatches.getByRole('option', { name: 'Half green' }).click();
  await expect(output).toHaveText('rgba(0, 128, 0, 0.5)');
  await expect(swatches.getByRole('option', { name: 'Half green' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('ArrowRight');
  await expect(swatches.getByRole('option', { name: 'dark vibrant blue' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(output).toHaveText('rgb(0, 0, 255)');
  // The uncontrolled picker without alpha has neither slider nor field.
  const opaque = picker(page, 'Uncontrolled color');
  await expect(opaque.getByRole('slider', { name: 'Alpha' })).toHaveCount(0);
  await expect(opaque.getByRole('textbox', { name: 'Alpha' })).toHaveCount(0);
});

test('copy writes the color as the fields show it', async ({ page, browserName, context }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium grants clipboard access to tests.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(fixture);
  await picker(page, 'Controlled color').getByRole('button', { name: 'Copy color' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('#1A73E8');
  const translucent = picker(page, 'Translucent color');
  await translucent.getByRole('button', { name: 'Copy color' }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('rgba(103, 80, 164, 0.5)');
});

test('the eyedropper picks a color where the browser has one', async ({ page }) => {
  await eyeDropper(page, '#ff8800');
  await page.goto(fixture);
  const controlled = picker(page, 'Controlled color');
  await controlled.getByRole('button', { name: 'Pick a color from the screen' }).click();
  await expect(page.getByTestId('color-last')).toHaveText('#ff8800');
  await expect(controlled.getByRole('textbox', { name: 'Hex' })).toHaveValue('#FF8800');
  // Turned off, and on a picker that takes no input, it doesn't show.
  await expect(
    picker(page, 'Uncontrolled color').getByRole('button', {
      name: 'Pick a color from the screen',
    }),
  ).toHaveCount(0);
  await expect(
    picker(page, 'Read only color').getByRole('button', { name: 'Pick a color from the screen' }),
  ).toHaveCount(0);
});

test('the eyedropper is hidden where the browser has none', async ({ page }) => {
  await eyeDropper(page, null);
  await page.goto(fixture);
  await expect(
    picker(page, 'Controlled color').getByRole('button', { name: 'Copy color' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pick a color from the screen' })).toHaveCount(0);
});

test('a controlled picker follows its value, also when the application rejects or replaces a color', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('color-picker');
  const controlled = picker(page, 'Controlled color');
  const hex = controlled.getByRole('textbox', { name: 'Hex' });
  const hue = controlled.getByRole('slider', { name: 'Hue' });
  const acceptedHue = await hue.inputValue();
  let changes = 0;
  for (const policy of ['Reject', 'Clamp']) {
    await scope.getByRole('button', { name: `${policy} color changes` }).click();
    await hue.focus();
    await page.keyboard.press('ArrowRight');
    await expect(scope.getByTestId('color-changes')).toHaveText(String(++changes));
    await expect(hue).toHaveValue(acceptedHue);
    await hex.fill('#abcdef');
    await hex.press('Enter');
    await expect(scope.getByTestId('color-changes')).toHaveText(String(++changes));
    await expect(hex).toHaveValue('#1A73E8');
  }
  await scope.getByRole('button', { name: 'Replace selected color' }).click();
  await expect(hex).toHaveValue('#FF0000');
  await expect(hue).toHaveValue('0');
  await expect(scope.getByTestId('color-changes')).toHaveText(String(changes));
});

test('ColorPickerButton opens its picker in a popover and submits its color', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('color-picker');
  const button = scope.getByRole('button', { name: 'Button color, #2F6F62' });
  await expect(button).toHaveText('#2F6F62');
  await button.click();
  const popover = page.getByRole('dialog', { name: 'Button color' });
  const hex = popover.getByRole('textbox', { name: 'Hex' });
  await expect(popover.getByRole('slider', { name: 'Button color, Color picker' })).toBeFocused();
  await hex.fill('#123456');
  await hex.press('Enter');
  await expect(scope.getByRole('button', { name: 'Button color, #123456' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await expect(scope.getByRole('button', { name: 'Button color, #123456' })).toBeFocused();
  await scope.getByRole('button', { name: 'Submit colors' }).click();
  await expect(scope.getByTestId('color-values')).toContainText('"buttonColor":"#123456"');
  await scope.getByRole('button', { name: 'Reset colors' }).click();
  await expect(scope.getByRole('button', { name: 'Button color, #2F6F62' })).toBeVisible();
});

test(
  'forms submit each color in its value format, and a reset restores the defaults',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(fixture);
    const scope = page.getByTestId('color-picker');
    const uncontrolled = picker(page, 'Uncontrolled color').getByRole('textbox', { name: 'Hex' });
    const external = picker(page, 'External color').getByRole('textbox', { name: 'Hex' });
    await uncontrolled.fill('#123456');
    await uncontrolled.press('Enter');
    await external.fill('#654321');
    await external.press('Enter');
    await scope.getByRole('button', { name: 'Submit colors' }).click();
    await expect(scope.getByTestId('color-values')).toHaveText(
      JSON.stringify({
        controlledColor: '#1a73e8',
        uncontrolledColor: '#123456',
        translucentColor: 'rgba(103, 80, 164, 0.5)',
        readOnlyColor: '#6750a4',
        buttonColor: '#2f6f62',
        externalColor: '#654321',
      }),
    );
    await scope.getByRole('checkbox', { name: 'Prevent color reset' }).check();
    await scope.getByRole('button', { name: 'Reset colors' }).click();
    await expect(uncontrolled).toHaveValue('#123456');
    await scope.getByRole('checkbox', { name: 'Prevent color reset' }).uncheck();
    await scope.getByRole('button', { name: 'Reset colors' }).click();
    await expect(uncontrolled).toHaveValue('#34A853');
    await expect(external).toHaveValue('#112233');
    // A reset tells a controlled picker nothing; its value stays the application's.
    await expect(scope.getByTestId('color-changes')).toHaveText('0');
  },
);

test('disabled and read-only pickers keep their color', async ({ page }) => {
  await page.goto(fixture);
  const disabled = picker(page, 'Disabled color');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled.getByRole('textbox', { name: 'Hex' })).toBeDisabled();
  for (const slider of await disabled.getByRole('slider').all())
    await expect(slider).toBeDisabled();
  const readOnly = picker(page, 'Read only color');
  const hex = readOnly.getByRole('textbox', { name: 'Hex' });
  await expect(hex).toHaveAttribute('readonly', '');
  await hex.focus();
  await hex.press('ArrowUp');
  await expect(hex).toHaveValue('#6750A4');
  await expect(readOnly.getByRole('slider', { name: 'Hue' })).toBeDisabled();
  // Copy still works on a read-only picker.
  await expect(readOnly.getByRole('button', { name: 'Copy color' })).toBeEnabled();
  await page
    .getByTestId('color-picker')
    .getByRole('checkbox', { name: 'Disable color editing' })
    .check();
  await expect(
    picker(page, 'Controlled color').getByRole('slider', { name: 'Hue' }),
  ).toBeDisabled();
});

test('a color swatch writes its value, names itself alone and fits a button icon', async ({
  page,
}) => {
  await page.goto(fixture);
  const swatches = page.getByTestId('color-swatches');
  await expect(swatches.locator('.env-color-swatch').first()).toHaveText('Violetrgb(103, 80, 164)');
  await expect(swatches.getByRole('img', { name: 'white' })).toBeVisible();
  const button = swatches.getByRole('button', { name: '#FFFFFF' });
  const swatch = button.locator('.env-color-swatch');
  const [swatchBox, iconBox] = await Promise.all([
    swatch.boundingBox(),
    button.locator('.env-icon').boundingBox(),
  ]);
  expect(Math.abs(swatchBox!.width - iconBox!.width)).toBeLessThan(1);
  expect(Math.abs(swatchBox!.height - iconBox!.height)).toBeLessThan(1);
  const [background, ring] = await swatch.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.backgroundColor, style.boxShadow];
  });
  // White on white stays visible by its inner hairline.
  expect(background).toBe('rgb(255, 255, 255)');
  expect(ring).toContain('inset');
});
