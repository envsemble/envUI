import { expect, onTestFinished, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/ColorPicker.fixture.tsx';
import { css, keyboard, recordClipboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

function eyeDropperBeforeMount(picked: string | null) {
  const own = Object.getOwnPropertyDescriptor(window, 'EyeDropper');
  Object.defineProperty(window, 'EyeDropper', {
    configurable: true,
    writable: true,
    value:
      picked === null
        ? undefined
        : class {
            open() {
              return Promise.resolve({ sRGBHex: picked });
            }
          },
  });
  onTestFinished(() => {
    if (own) Object.defineProperty(window, 'EyeDropper', own);
    else delete (window as { EyeDropper?: unknown }).EyeDropper;
  });
}

const scope = () => page.getByTestId('color-picker');
const picker = (name: string) => scope().getByRole('group', { name, exact: true });
const output = (testId: string) => () => page.getByTestId(testId).element().textContent;
const valueOf = (locator: Locator) => () => (locator.element() as HTMLInputElement).value;
const focus = (locator: Locator) => (locator.element() as HTMLElement).focus();
async function typeAndCommit(field: Locator, text: string) {
  await field.fill(text);
  await keyboard.press('Enter');
}
const labels = (locator: Locator) =>
  [...locator.element().querySelectorAll('.env-color-picker-field-label')].map(
    (label) => label.textContent,
  );
async function chooseFormat(group: Locator, format: string) {
  await group.getByRole('button', { name: /^Color format/ }).click();
  await page.getByRole('menuitemradio', { name: format }).click();
}

test(
  'the area and the hue slider move the color with the keyboard',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const controlled = picker('Controlled color');
    const area = controlled.getByRole('slider', { name: 'Controlled color, Color picker' });
    const hex = controlled.getByRole('textbox', { name: 'Hex' });
    const last = output('color-last');
    focus(area);
    await keyboard.press('ArrowLeft');
    await expect.poll(last).not.toBe('');
    const lessSaturated = last()!;
    expect(valueOf(hex)()).toBe(lessSaturated.toUpperCase());
    await keyboard.press('ArrowUp');
    await expect.poll(last).not.toBe(lessSaturated);
    const thumb = controlled
      .element()
      .querySelector('.env-color-picker-area .env-color-picker-thumb')!;
    expect(css(thumb, 'outline-style')).toBe('solid');
    const hue = controlled.getByRole('slider', { name: 'Hue' });
    await expect.element(hue).toHaveAttribute('aria-orientation', 'vertical');
    const before = Number(valueOf(hue)());
    focus(hue);
    await keyboard.press('ArrowUp');
    await expect.poll(valueOf(hue)).toBe(String(before + 1));
    await keyboard.press('ArrowRight');
    await expect.poll(valueOf(hue)).toBe(String(before + 2));
    await keyboard.press('ArrowDown');
    await expect.poll(valueOf(hue)).toBe(String(before + 1));
    await keyboard.press('Home');
    await expect.poll(valueOf(hue)).toBe('0');
    expect(hue.element().getAttribute('aria-valuetext')).toMatch(/^0°/);
    expect(valueOf(hex)()).toMatch(/^#[0-9A-F]{6}$/);
    await expect.poll(output('color-changes')).toBe('6');
  },
);

test('each format types the color in its own fields', async () => {
  mount(fixture);
  const controlled = picker('Controlled color');
  const last = output('color-last');
  const hex = controlled.getByRole('textbox', { name: 'Hex' });
  await typeAndCommit(hex, 'ff8800');
  await expect.poll(last).toBe('#ff8800');
  await expect.poll(valueOf(hex)).toBe('#FF8800');
  await hex.fill('#12');
  (hex.element() as HTMLElement).blur();
  await expect.poll(valueOf(hex)).toBe('#FF8800');
  expect(output('color-changes')()).toBe('1');

  await chooseFormat(controlled, 'RGB');
  await expect.poll(() => labels(controlled)).toEqual(['R', 'G', 'B']);
  const red = controlled.getByRole('textbox', { name: 'Red' });
  expect(valueOf(red)()).toBe('255');
  expect(valueOf(controlled.getByRole('textbox', { name: 'Blue' }))()).toBe('0');
  await typeAndCommit(red, '16');
  await expect.poll(last).toBe('#108800');
  await keyboard.press('ArrowUp');
  await expect.poll(last).toBe('#118800');

  await chooseFormat(controlled, 'HSL');
  const lightness = controlled.getByRole('textbox', { name: 'Lightness' });
  await expect.element(controlled.getByRole('textbox', { name: 'Hue' })).toBeInTheDocument();
  await typeAndCommit(lightness, '50');
  await expect.poll(valueOf(lightness)).toBe('50%');
  expect(controlled.getByRole('textbox', { name: 'Hex' }).query()).toBeNull();
});

test(
  'several formats show their fields together, each editing the same color, and Tab moves row by row',
  { tags: ['engines'] },
  async () => {
    eyeDropperBeforeMount(null);
    mount(fixture);
    const every = picker('Every format');
    const color = output('color-every');
    expect(every.getByRole('button', { name: /^Color format/ }).query()).toBeNull();
    expect(
      [...every.element().querySelectorAll('.env-color-picker-row')].map((row) =>
        row.getAttribute('aria-label'),
      ),
    ).toEqual(['Hex', 'RGB', 'HSL']);
    const [hexRow, rgbRow, hslRow] = ['Hex', 'RGB', 'HSL'].map((name) =>
      every.getByRole('group', { name, exact: true }),
    ) as [Locator, Locator, Locator];
    const hex = hexRow.getByRole('textbox', { name: 'Hex' });
    const red = rgbRow.getByRole('textbox', { name: 'Red' });
    const blue = rgbRow.getByRole('textbox', { name: 'Blue' });
    const hue = hslRow.getByRole('textbox', { name: 'Hue' });
    const lightness = hslRow.getByRole('textbox', { name: 'Lightness' });
    expect(valueOf(hex)()).toBe('#336699');
    expect(valueOf(red)()).toBe('51');
    expect(valueOf(hue)()).toBe('210°');
    expect(valueOf(lightness)()).toBe('40%');
    expect(labels(rgbRow)).toEqual(['R', 'G', 'B', 'A']);
    expect(labels(hslRow)).toEqual(['H', 'S', 'L', 'A']);

    focus(hex);
    for (const next of [
      hexRow.getByRole('textbox', { name: 'Alpha' }),
      every.getByRole('button', { name: 'Copy color as Hex' }),
      red,
      rgbRow.getByRole('textbox', { name: 'Green' }),
      blue,
      rgbRow.getByRole('textbox', { name: 'Alpha' }),
      every.getByRole('button', { name: 'Copy color as RGB' }),
      hue,
    ]) {
      await keyboard.press('Tab');
      await expect.element(next).toHaveFocus();
    }

    await typeAndCommit(hex, 'ff8800');
    await expect.poll(color).toBe('#ff8800');
    expect(valueOf(red)()).toBe('255');
    expect(valueOf(blue)()).toBe('0');
    expect(valueOf(hue)()).toBe('32°');
    await typeAndCommit(red, '16');
    await expect.poll(color).toBe('#108800');
    expect(valueOf(hex)()).toBe('#108800');
    await keyboard.press('ArrowUp');
    await expect.poll(color).toBe('#118800');
    await typeAndCommit(lightness, '50');
    await expect.poll(valueOf(hex)).not.toBe('#118800');
    await expect.poll(color).toBe(valueOf(hex)().toLowerCase());
    await typeAndCommit(hslRow.getByRole('textbox', { name: 'Alpha' }), '50');
    await expect.poll(valueOf(rgbRow.getByRole('textbox', { name: 'Alpha' }))).toBe('50%');
    expect(valueOf(hexRow.getByRole('textbox', { name: 'Alpha' }))()).toBe('50%');
    expect(color()).toMatch(/^#[0-9a-f]{6}80$/);
    const columns = [...every.element().querySelectorAll('.env-color-picker-fields')].map(
      (fields) => {
        const { x, width } = fields.getBoundingClientRect();
        return `${Math.round(x)} ${Math.round(width)}`;
      },
    );
    expect(new Set(columns).size).toBe(1);
    const alphas = [
      ...every.element().querySelectorAll('.env-color-picker-field[data-channel="alpha"]'),
    ].map((field) => Math.round(field.getBoundingClientRect().x));
    expect(new Set(alphas).size).toBe(1);
  },
);

test('alpha has a slider and a field, and values keep it while translucent', async () => {
  mount(fixture);
  const translucent = picker('Translucent color');
  const color = output('color-translucent');
  const alpha = translucent.getByRole('textbox', { name: 'Alpha' });
  expect(valueOf(alpha)()).toBe('50%');
  await typeAndCommit(alpha, '25');
  await expect.poll(color).toBe('rgba(103, 80, 164, 0.25)');
  const slider = translucent.getByRole('slider', { name: 'Alpha' });
  await expect.element(slider).toHaveAttribute('aria-orientation', 'vertical');
  focus(slider);
  await keyboard.press('ArrowDown');
  await expect.poll(valueOf(alpha)).toBe('24%');
  await keyboard.press('End');
  await expect.poll(color).toBe('rgb(103, 80, 164)');
  expect(valueOf(alpha)()).toBe('100%');
  const swatches = translucent.getByRole('listbox', { name: 'Swatches' });
  await swatches.getByRole('option', { name: 'Half green' }).click();
  await expect.poll(color).toBe('rgba(0, 128, 0, 0.5)');
  await expect
    .element(swatches.getByRole('option', { name: 'Half green' }))
    .toHaveAttribute('aria-selected', 'true');
  await keyboard.press('ArrowRight');
  await expect.element(swatches.getByRole('option', { name: 'dark vibrant blue' })).toHaveFocus();
  await keyboard.press('Enter');
  await expect.poll(color).toBe('rgb(0, 0, 255)');
  const opaque = picker('Uncontrolled color');
  expect(opaque.getByRole('slider', { name: 'Alpha' }).query()).toBeNull();
  expect(opaque.getByRole('textbox', { name: 'Alpha' }).query()).toBeNull();
});

test('copy writes the color as the fields show it, also from a read-only picker', async () => {
  const { writes } = recordClipboard('available');
  mount(fixture);
  await picker('Controlled color').getByRole('button', { name: 'Copy color' }).click();
  await expect.poll(() => writes).toEqual(['#1A73E8']);
  const translucent = picker('Translucent color');
  await chooseFormat(translucent, 'RGB');
  await translucent.getByRole('button', { name: 'Copy color' }).click();
  await expect.poll(() => writes.at(-1)).toBe('rgba(103, 80, 164, 0.5)');
  const readOnly = picker('Read only color');
  const hex = readOnly.getByRole('textbox', { name: 'Hex' });
  focus(hex);
  await keyboard.press('ArrowUp');
  expect(valueOf(hex)()).toBe('#6750A4');
  await readOnly.getByRole('button', { name: 'Copy color' }).click();
  await expect.poll(() => writes.at(-1)).toBe('#6750A4');
});

test('the eyedropper picks a color where the browser has one, and is hidden where it has none', async () => {
  eyeDropperBeforeMount('#ff8800');
  const { remount } = mount(fixture);
  const controlled = picker('Controlled color');
  const pick = { name: 'Pick a color from the screen' };
  await controlled.getByRole('button', pick).click();
  await expect.poll(output('color-last')).toBe('#ff8800');
  await expect.poll(valueOf(controlled.getByRole('textbox', { name: 'Hex' }))).toBe('#FF8800');
  expect(picker('Uncontrolled color').getByRole('button', pick).query()).toBeNull();
  expect(picker('Read only color').getByRole('button', pick).query()).toBeNull();

  eyeDropperBeforeMount(null);
  remount();
  await expect
    .element(picker('Controlled color').getByRole('button', { name: 'Copy color' }))
    .toBeInTheDocument();
  expect(scope().getByRole('button', pick).query()).toBeNull();
});

test('a controlled picker follows its value, also when the application rejects or replaces a color', async () => {
  mount(fixture);
  const controlled = picker('Controlled color');
  const hex = controlled.getByRole('textbox', { name: 'Hex' });
  const hue = controlled.getByRole('slider', { name: 'Hue' });
  const changes = output('color-changes');
  const acceptedHue = valueOf(hue)();
  let count = 0;
  for (const policy of ['Reject', 'Clamp']) {
    await scope()
      .getByRole('button', { name: `${policy} color changes` })
      .click();
    focus(hue);
    await keyboard.press('ArrowRight');
    await expect.poll(changes).toBe(String(++count));
    expect(valueOf(hue)()).toBe(acceptedHue);
    await typeAndCommit(hex, '#abcdef');
    await expect.poll(changes).toBe(String(++count));
    await expect.poll(valueOf(hex)).toBe('#1A73E8');
  }
  await scope().getByRole('button', { name: 'Replace selected color' }).click();
  await expect.poll(valueOf(hex)).toBe('#FF0000');
  expect(valueOf(hue)()).toBe('0');
  expect(changes()).toBe(String(count));
});

test(
  'forms submit each color in its value format, ColorPickerButton among them, and a reset restores the defaults',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const values = output('color-values');
    const button = scope().getByRole('button', { name: 'Button color, #2F6F62' });
    expect(button.element().textContent).toBe('#2F6F62');
    await button.click();
    const popover = page.getByRole('dialog', { name: 'Button color' });
    await expect
      .element(popover.getByRole('slider', { name: 'Button color, Color picker' }))
      .toHaveFocus();
    await typeAndCommit(popover.getByRole('textbox', { name: 'Hex' }), '#123456');
    const changed = scope().getByRole('button', { name: 'Button color, #123456' });
    await expect.element(changed).toBeInTheDocument();
    await keyboard.press('Escape');
    await expect.poll(() => popover.query()).toBeNull();
    await expect.element(changed).toHaveFocus();

    const uncontrolled = picker('Uncontrolled color').getByRole('textbox', { name: 'Hex' });
    const external = picker('External color').getByRole('textbox', { name: 'Hex' });
    await typeAndCommit(uncontrolled, '#123456');
    await typeAndCommit(external, '#654321');
    await scope().getByRole('button', { name: 'Submit colors' }).click();
    await expect.poll(values).toBe(
      JSON.stringify({
        controlledColor: '#1a73e8',
        uncontrolledColor: '#123456',
        translucentColor: 'rgba(103, 80, 164, 0.5)',
        readOnlyColor: '#6750a4',
        buttonColor: '#123456',
        externalColor: '#654321',
      }),
    );
    const prevent = scope().getByRole('checkbox', { name: 'Prevent color reset' });
    await prevent.click();
    await scope().getByRole('button', { name: 'Reset colors' }).click();
    expect(valueOf(uncontrolled)()).toBe('#123456');
    await prevent.click();
    await scope().getByRole('button', { name: 'Reset colors' }).click();
    await expect.poll(valueOf(uncontrolled)).toBe('#34A853');
    expect(valueOf(external)()).toBe('#112233');
    await expect
      .element(scope().getByRole('button', { name: 'Button color, #2F6F62' }))
      .toBeInTheDocument();
    expect(output('color-changes')()).toBe('0');
  },
);

test("a color picker button takes the application's own trigger, which joins a toolbar and shows the color", async () => {
  mount({ default: fixture.ColorTriggerFixture });
  const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
  const textColor = toolbar.getByTestId('text-color');
  await expect.element(textColor).toHaveAccessibleName('Text color, #D32F2F');
  expect(textColor.element().classList.contains('env-color-picker-button')).toBe(false);
  focus(toolbar.getByRole('button', { name: 'Bold' }));
  await keyboard.press('ArrowRight');
  await expect.element(textColor).toHaveFocus();
  await keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Text color' });
  await expect.element(dialog).toBeVisible();
  await dialog.getByRole('listbox', { name: 'Swatches' }).getByRole('option').nth(1).click();
  await expect.poll(() => css(textColor, 'border-bottom-color')).toBe('rgb(25, 118, 210)');
});
