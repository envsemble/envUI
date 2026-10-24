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

test(
  'the area and the hue slider move the color with the keyboard',
  { tag: '@engines' },
  async ({ page }) => {
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
    // The hue slider is vertical: Up raises it and Down lowers it, as Right and Left do.
    const hue = controlled.getByRole('slider', { name: 'Hue' });
    await expect(hue).toHaveAttribute('aria-orientation', 'vertical');
    const before = Number(await hue.inputValue());
    await hue.focus();
    await page.keyboard.press('ArrowUp');
    await expect(hue).toHaveValue(String(before + 1));
    await page.keyboard.press('ArrowRight');
    await expect(hue).toHaveValue(String(before + 2));
    await page.keyboard.press('ArrowDown');
    await expect(hue).toHaveValue(String(before + 1));
    await page.keyboard.press('Home');
    await expect(hue).toHaveValue('0');
    await expect(hue).toHaveAttribute('aria-valuetext', /^0°/);
    await expect(hex).toHaveValue(/^#[0-9A-F]{6}$/);
    await expect(page.getByTestId('color-changes')).toHaveText('6');
  },
);

test(
  'the area is square, with the strips upright at its side and as tall',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(fixture);
    const translucent = picker(page, 'Translucent color');
    const area = await translucent.locator('.env-color-picker-area').boundingBox();
    expect(Math.abs(area!.width - area!.height)).toBeLessThan(1);
    const tracks = await translucent.locator('.env-color-picker-track').all();
    expect(tracks).toHaveLength(2);
    for (const track of tracks) {
      const box = await track.boundingBox();
      expect(box!.x).toBeGreaterThan(area!.x + area!.width);
      expect(Math.abs(box!.y - area!.y)).toBeLessThan(1);
      expect(Math.abs(box!.height - area!.height)).toBeLessThan(1);
    }
    // Under them, the fields span the area and the strips, and copy ends at the outer strip.
    const outer = await tracks[1].boundingBox();
    const [fields, copy] = await Promise.all([
      translucent.locator('.env-color-picker-fields').boundingBox(),
      translucent.locator('.env-color-picker-copy').boundingBox(),
    ]);
    expect(Math.abs(fields!.x - area!.x)).toBeLessThan(1);
    expect(Math.abs(fields!.x + fields!.width - (outer!.x + outer!.width))).toBeLessThan(1);
    expect(Math.abs(copy!.x + copy!.width - (outer!.x + outer!.width))).toBeLessThan(1);
    // The thumb sits on the strip's centre line, at its value from the bottom.
    const alpha = translucent.locator('.env-color-picker-alpha');
    const [track, thumb] = await Promise.all([
      alpha.locator('.env-color-picker-track').boundingBox(),
      alpha.locator('.env-color-picker-thumb').boundingBox(),
    ]);
    expect(Math.abs(thumb!.x + thumb!.width / 2 - (track!.x + track!.width / 2))).toBeLessThan(1);
    expect(Math.abs(thumb!.y + thumb!.height / 2 - (track!.y + track!.height / 2))).toBeLessThan(2);
  },
);

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

  await controlled.getByRole('button', { name: /^Color format/ }).click();
  await page.getByRole('menuitemradio', { name: 'RGB' }).click();
  // Each number shows its channel's letter.
  await expect(controlled.locator('.env-color-picker-field-label')).toHaveText(['R', 'G', 'B']);
  const red = controlled.getByRole('textbox', { name: 'Red' });
  await expect(red).toHaveValue('255');
  await expect(controlled.getByRole('textbox', { name: 'Blue' })).toHaveValue('0');
  await red.fill('16');
  await red.press('Enter');
  await expect(last).toHaveText('#108800');
  // The arrow keys step a channel.
  await red.press('ArrowUp');
  await expect(last).toHaveText('#118800');

  await controlled.getByRole('button', { name: /^Color format/ }).click();
  await page.getByRole('menuitemradio', { name: 'HSL' }).click();
  const lightness = controlled.getByRole('textbox', { name: 'Lightness' });
  await expect(controlled.getByRole('textbox', { name: 'Hue' })).toBeVisible();
  await lightness.fill('50');
  await lightness.press('Enter');
  await expect(controlled.getByRole('textbox', { name: 'Lightness' })).toHaveValue('50%');
  await expect(controlled.getByRole('textbox', { name: 'Hex' })).toHaveCount(0);
});

test('several formats show their fields together, each editing the same color', async ({
  page,
}) => {
  await page.goto(fixture);
  const every = picker(page, 'Every format');
  const output = page.getByTestId('color-every');
  // No select: a row for each format, named by the format it shows, in the order given.
  await expect(every.getByRole('button', { name: /^Color format/ })).toHaveCount(0);
  expect(
    await every
      .locator('.env-color-picker-row')
      .evaluateAll((rows) => rows.map((row) => row.getAttribute('aria-label'))),
  ).toEqual(['Hex', 'RGB', 'HSL']);
  const [hexRow, rgbRow, hslRow] = ['Hex', 'RGB', 'HSL'].map((name) =>
    every.getByRole('group', { name, exact: true }),
  );
  const hex = hexRow.getByRole('textbox', { name: 'Hex' });
  const red = rgbRow.getByRole('textbox', { name: 'Red' });
  const blue = rgbRow.getByRole('textbox', { name: 'Blue' });
  const hue = hslRow.getByRole('textbox', { name: 'Hue' });
  const lightness = hslRow.getByRole('textbox', { name: 'Lightness' });
  await expect(hex).toHaveValue('#336699');
  await expect(red).toHaveValue('51');
  await expect(hue).toHaveValue('210°');
  await expect(lightness).toHaveValue('40%');
  // Each row's channels show their letters, and alpha follows in every row.
  await expect(rgbRow.locator('.env-color-picker-field-label')).toHaveText(['R', 'G', 'B', 'A']);
  await expect(hslRow.locator('.env-color-picker-field-label')).toHaveText(['H', 'S', 'L', 'A']);
  // Typing in any format moves the others with it.
  await hex.fill('ff8800');
  await hex.press('Enter');
  await expect(output).toHaveText('#ff8800');
  await expect(red).toHaveValue('255');
  await expect(blue).toHaveValue('0');
  await expect(hue).toHaveValue('32°');
  await red.fill('16');
  await red.press('Enter');
  await expect(output).toHaveText('#108800');
  await expect(hex).toHaveValue('#108800');
  await red.press('ArrowUp');
  await expect(output).toHaveText('#118800');
  await lightness.fill('50');
  await lightness.press('Enter');
  await expect(hex).not.toHaveValue('#118800');
  await expect(output).toHaveText((await hex.inputValue()).toLowerCase());
  await hslRow.getByRole('textbox', { name: 'Alpha' }).fill('50');
  await hslRow.getByRole('textbox', { name: 'Alpha' }).press('Enter');
  await expect(rgbRow.getByRole('textbox', { name: 'Alpha' })).toHaveValue('50%');
  await expect(hexRow.getByRole('textbox', { name: 'Alpha' })).toHaveValue('50%');
  await expect(output).toHaveText(/^#[0-9a-f]{6}80$/);
  // Each format copies itself.
  for (const format of ['Hex', 'RGB', 'HSL'])
    await expect(every.getByRole('button', { name: `Copy color as ${format}` })).toBeVisible();
  // The fields of every row share their columns, so the letters and numbers line up.
  const boxes = await every.locator('.env-color-picker-fields').evaluateAll((fields) =>
    fields.map((field) => {
      const { x, width } = field.getBoundingClientRect();
      return [Math.round(x), Math.round(width)];
    }),
  );
  expect(new Set(boxes.map(String)).size).toBe(1);
  const alphas = await every
    .locator('.env-color-picker-field[data-channel="alpha"]')
    .evaluateAll((fields) => fields.map((field) => Math.round(field.getBoundingClientRect().x)));
  expect(new Set(alphas).size).toBe(1);
});

test('Tab moves through several formats row by row', { tag: '@engines' }, async ({ page }) => {
  await eyeDropper(page, null);
  await page.goto(fixture);
  const every = picker(page, 'Every format');
  const rows = ['Hex', 'RGB', 'HSL'].map((name) => every.getByRole('group', { name, exact: true }));
  await rows[0].getByRole('textbox', { name: 'Hex' }).focus();
  const order = [
    rows[0].getByRole('textbox', { name: 'Alpha' }),
    every.getByRole('button', { name: 'Copy color as Hex' }),
    rows[1].getByRole('textbox', { name: 'Red' }),
    rows[1].getByRole('textbox', { name: 'Green' }),
    rows[1].getByRole('textbox', { name: 'Blue' }),
    rows[1].getByRole('textbox', { name: 'Alpha' }),
    every.getByRole('button', { name: 'Copy color as RGB' }),
    rows[2].getByRole('textbox', { name: 'Hue' }),
  ];
  for (const next of order) {
    await page.keyboard.press('Tab');
    await expect(next).toBeFocused();
  }
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
  await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  await slider.focus();
  await page.keyboard.press('ArrowDown');
  await expect(alpha).toHaveValue('24%');
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
  await translucent.getByRole('button', { name: /^Color format/ }).click();
  await page.getByRole('menuitemradio', { name: 'RGB' }).click();
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
