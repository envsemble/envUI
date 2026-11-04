import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=sliders`);
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('a slider is a labelled range with a visible value linked to it', async ({ page }) => {
  const scope = page.getByTestId('sliders-light');
  const opacity = scope.getByRole('slider', { name: 'Opacity' });
  await expect(opacity).toHaveAttribute('aria-valuenow', '40');
  await expect(opacity).toHaveAttribute('min', '0');
  await expect(opacity).toHaveAttribute('max', '100');
  await expect(opacity).toHaveAttribute('aria-valuetext', '40%');
  await expect(opacity).toHaveAccessibleDescription('Applies to the selected layer');
  const output = scope.locator('output.env-slider-value').first();
  await expect(output).toHaveText('40%');
  await expect(output).toHaveAttribute('for', (await opacity.getAttribute('id'))!);
  await expect(output).toHaveAttribute('aria-live', 'off');
  // The label is inside the slider, which takes the press: pressing it focuses the slider and
  // chooses the value there, as pressing anywhere in the field does.
  await scope.getByText('Opacity', { exact: true }).click({ force: true });
  await expect(opacity).toBeFocused();
  await expect(opacity).not.toHaveAttribute('aria-valuenow', '40');
});

test('the keyboard moves the value by steps, large steps and to the ends', async ({ page }) => {
  const scope = page.getByTestId('sliders-light');
  const opacity = scope.getByRole('slider', { name: 'Opacity' });
  const state = page.getByTestId('opacity-light');
  const output = scope.locator('output.env-slider-value').first();
  await opacity.focus();
  await page.keyboard.press('ArrowRight');
  await expect(state).toHaveText('41');
  await expect(output).toHaveText('41%');
  await expect(opacity).toHaveAttribute('aria-valuetext', '41%');
  await page.keyboard.press('ArrowUp');
  await expect(state).toHaveText('42');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(state).toHaveText('52');
  await page.keyboard.press('PageUp');
  await expect(state).toHaveText('62');
  await page.keyboard.press('PageDown');
  await expect(state).toHaveText('52');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowLeft');
  await expect(state).toHaveText('50');
  await page.keyboard.press('End');
  await expect(state).toHaveText('100');
  await page.keyboard.press('ArrowRight');
  await expect(state).toHaveText('100');
  await page.keyboard.press('Home');
  await expect(state).toHaveText('0');
  await expect(page.getByTestId('commits-light')).toContainText('0');
  // Keyboard focus rings the whole field.
  await expect(scope.locator('.env-slider-control').first()).toHaveCSS('outline-style', 'solid');

  // Steps follow step and the range; the large step is a tenth of the range.
  const scale = scope.getByRole('slider', { name: 'Scale' });
  await scale.focus();
  await page.keyboard.press('ArrowRight');
  await expect(scale).toHaveAttribute('aria-valuenow', '110');
  await page.keyboard.press('PageUp');
  await expect(scale).toHaveAttribute('aria-valuenow', '130');
  await expect(scope.locator('output.env-slider-value').nth(2)).toHaveText('130');
});

test(
  'pressing the track and dragging the thumb set the value and commit it once',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('sliders-light');
    const opacity = scope.getByRole('slider', { name: 'Opacity' });
    const track = scope.locator('.env-slider-track').first();
    const box = (await track.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
    await expect(opacity).toHaveAttribute('aria-valuenow', '25');
    await expect(page.getByTestId('commits-light')).toHaveText('25');
    const thumb = scope.locator('.env-slider-thumb').first();
    const thumbBox = (await thumb.boundingBox())!;
    // The thumb is centered on the value along the track.
    expect(thumbBox.x + thumbBox.width / 2).toBeCloseTo(box.x + box.width * 0.25, 0);
    await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 5 });
    await expect(thumb).toHaveAttribute('data-dragging', '');
    await page.mouse.up();
    await expect(opacity).toHaveAttribute('aria-valuenow', '75');
    await expect(page.getByTestId('opacity-light')).toHaveText('75');
    await expect(page.getByTestId('commits-light')).toHaveText('25 75');
    const indicator = (await scope.locator('.env-slider-indicator').first().boundingBox())!;
    expect(indicator.width / box.width).toBeCloseTo(0.75, 2);
  },
);

test(
  'sliders submit their value with a form and restore it on reset',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('sliders-light');
    const submitted = page.getByTestId('sliders-submitted-light');
    await scope.getByRole('button', { name: 'Submit sliders' }).click();
    // A disabled slider is left out, like other disabled controls.
    await expect(submitted).toHaveText('volume=30 scale=100');
    const volume = scope.getByRole('slider', { name: 'Volume' });
    await volume.focus();
    await page.keyboard.press('ArrowRight');
    await expect(volume).toHaveAttribute('aria-valuenow', '35');
    await scope.getByRole('button', { name: 'Submit sliders' }).click();
    await expect(submitted).toHaveText('volume=35 scale=100');
    await scope.getByRole('button', { name: 'Reset sliders' }).click();
    await expect(volume).toHaveAttribute('aria-valuenow', '30');
    await expect(scope.locator('output.env-slider-value').nth(1)).toHaveText('30');
    await scope.getByRole('button', { name: 'Submit sliders' }).click();
    await expect(submitted).toHaveText('volume=30 scale=100');

    const balance = scope.getByRole('slider', { name: 'Balance' });
    await expect(balance).toBeDisabled();
    await expect(scope.locator('.env-slider-control').nth(3)).toHaveCSS('opacity', '0.48');
    // The group the label names is disabled too, so its faded label and value are an inactive
    // control's, which WCAG exempts from contrast; an enabled one says nothing.
    await expect(scope.locator('.env-slider').nth(3)).toHaveAttribute('aria-disabled', 'true');
    await expect(scope.locator('.env-slider').first()).not.toHaveAttribute('aria-disabled');
  },
);

test('sliders fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scope = page.getByTestId('sliders-light');
  const control = (await scope.locator('.env-slider-control').first().boundingBox())!;
  expect(control.x + control.width).toBeLessThanOrEqual(390);
  const opacity = scope.getByRole('slider', { name: 'Opacity' });
  await opacity.focus();
  await page.keyboard.press('End');
  const thumb = (await scope.locator('.env-slider-thumb').first().boundingBox())!;
  // At the end of the range the thumb stays inside the control.
  expect(thumb.x + thumb.width).toBeLessThanOrEqual(control.x + control.width + 0.5);
});

test('coarse pointers get the touch height, the whole field taking the finger', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${fixtureUrl}/?fixture=sliders`);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const scope = page.getByTestId('sliders-light');
  await expect(scope.locator('.env-slider-control').first()).toHaveCSS('height', '44px');
  await expect(scope.locator('.env-slider-control').first()).toHaveCSS('touch-action', 'none');
  await context.close();
});

test('a slider is a field: as tall as the fields, with their corners, its label and value inside', async ({
  page,
}) => {
  const scope = page.getByTestId('sliders-light');
  const slider = scope.locator('.env-slider').first();
  const control = slider.locator('.env-slider-control');
  const box = (await control.boundingBox())!;
  // As tall as a field of the control height, with the same rounded ends, and no outline.
  const field = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.blockSize = 'var(--env-control-height)';
    document.querySelector('[data-testid="sliders-light"]')!.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  });
  expect(box.height).toBeCloseTo(field, 0);
  // The fields' corners: the capped full corner, which the browser draws as rounded ends.
  expect(
    await control.evaluate((e) => {
      const probe = document.createElement('div');
      probe.style.blockSize = 'var(--env-radius-full)';
      e.append(probe);
      const full = probe.getBoundingClientRect().height;
      probe.remove();
      return Math.abs(Number.parseFloat(getComputedStyle(e).borderTopLeftRadius) - full);
    }),
  ).toBeLessThan(0.5);
  await expect(control).toHaveCSS('box-shadow', 'none');
  await expect(control).toHaveCSS('border-top-style', 'none');
  // The label sits inside at the start and the value at the end, in a field's type, and the value
  // with numbers of one width.
  const label = (await slider.locator('.env-slider-label').boundingBox())!;
  const value = slider.locator('.env-slider-value');
  const valueBox = (await value.boundingBox())!;
  expect(label.x).toBeGreaterThan(box.x);
  expect(label.y).toBeGreaterThan(box.y);
  expect(label.y + label.height).toBeLessThan(box.y + box.height);
  expect(valueBox.x + valueBox.width).toBeLessThan(box.x + box.width);
  expect(valueBox.x).toBeGreaterThan(label.x + label.width);
  const type = await slider.evaluate((root) => {
    const field = document.createElement('p');
    field.className = 'env-text';
    root.append(field);
    const style = getComputedStyle(field);
    const expected = [style.fontFamily, style.fontSize];
    field.remove();
    return expected;
  });
  for (const part of [value, slider.locator('.env-slider-label')])
    expect(
      await part.evaluate((e) => [getComputedStyle(e).fontFamily, getComputedStyle(e).fontSize]),
    ).toEqual(type);
  await expect(value).toHaveCSS('font-variant-numeric', 'tabular-nums');
  await expect(value).toHaveClass(/(^| )env-text( |$)/);
  // The fill runs from the slider's own start to the value, 40% of the whole field.
  const fill = (await slider.locator('.env-slider-indicator').boundingBox())!;
  expect(Math.abs(fill.x - box.x)).toBeLessThanOrEqual(0.5);
  expect(fill.width / box.width).toBeCloseTo(0.4, 2);
  // The text never dims: the handle and the fill's end fade under it instead, as the tests of the
  // states below show.
  for (const part of [
    slider.locator('.env-slider-header'),
    slider.locator('.env-slider-label'),
    value,
  ]) {
    await expect(part).toHaveCSS('opacity', '1');
    await expect(part).toHaveCSS('mask-image', 'none');
  }
  // Ten parts of 0 to 100 by large steps of 10; a range of few steps is cut at every step.
  await expect(slider).toHaveCSS('--env-slider-ticks', '10');
});

/** The parts of the first slider whose look changes with its state, read from computed styles. */
function stateOf(page: Page) {
  const slider = page.getByTestId('sliders-light').locator('.env-slider').first();
  const control = slider.locator('.env-slider-control');
  return {
    slider,
    control,
    input: slider.getByRole('slider'),
    thumb: slider.locator('.env-slider-thumb'),
    ticks: () =>
      slider.locator('.env-slider-track').evaluate((e) => getComputedStyle(e, '::after').opacity),
    // The fade at the fill's end: a gradient over its last stretch, out of sight at 0.
    fillEnd: () =>
      slider
        .locator('.env-slider-indicator')
        .evaluate((e) => getComputedStyle(e, '::after').opacity),
    veil: () =>
      control.evaluate((e) => getComputedStyle(e).getPropertyValue('--env-slider-veil').trim()),
  };
}

/** Expects the slider at rest: its text and fill only, with no handle, ticks or fade. */
async function expectRest(state: ReturnType<typeof stateOf>) {
  await expect(state.control).not.toHaveAttribute('data-handle');
  await expect(state.control).not.toHaveAttribute('data-ruler');
  await expect(state.thumb).toHaveCSS('opacity', '0');
  await expect.poll(state.ticks).toBe('0');
  await expect.poll(state.fillEnd).toBe('0');
}

test('at rest a slider shows its text and fill only, with no handle, ticks or fade', async ({
  page,
}) => {
  const state = stateOf(page);
  await page.mouse.move(0, 0);
  await expectRest(state);
  // Even where the fill ends under the label, it ends crisply.
  await state.input.focus();
  await page.keyboard.press('Home');
  await state.input.blur();
  await expect.poll(state.veil).toBe('1');
  await expectRest(state);
});

test(
  'hover shows the handle and the ticks, the handle faded where it sits behind the label',
  { tag: '@engines' },
  async ({ page }) => {
    const state = stateOf(page);
    const box = (await state.control.boundingBox())!;
    const y = box.y + box.height / 2;
    // At 40%, clear of the text: the handle in full and the fill's end crisp.
    await page.mouse.move(box.x + box.width * 0.5, y);
    await expect(state.control).toHaveAttribute('data-handle', '');
    await expect(state.control).toHaveAttribute('data-ruler', '');
    await expect.poll(state.veil).toBe('0');
    await expect(state.thumb).toHaveCSS('opacity', '1');
    await expect.poll(state.ticks).toBe('0.35');
    await expect.poll(state.fillEnd).toBe('0');
    // Leave, move the value under the label with the keyboard, and hover again: the handle and the
    // fill's end fade there, while the text stays at full strength.
    await page.mouse.move(0, 0);
    await state.input.focus();
    await page.keyboard.press('Home');
    await state.input.blur();
    await page.mouse.move(box.x + box.width * 0.5, y);
    await expect.poll(state.veil).toBe('1');
    await expect(state.thumb).toHaveCSS('opacity', '0.25');
    await expect.poll(state.fillEnd).toBe('1');
    await expect.poll(state.ticks).toBe('0.35');
    await expect(state.slider.locator('.env-slider-label')).toHaveCSS('opacity', '1');
  },
);

test('the ticks fade under the label and the value, as the handle does', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const state = stateOf(page);
  const box = (await state.control.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
  await expect.poll(state.ticks).toBe('0.35');
  // Each tick is faint, at a quarter, where it sits within half a line of the label or the value,
  // and in full between them: read from the measured clear stretch the mask keeps whole.
  const ticks = await state.slider.evaluate((root) => {
    const track = root.querySelector('.env-slider-track')!.getBoundingClientRect();
    const control = root.querySelector<HTMLElement>('.env-slider-control')!;
    const style = getComputedStyle(control);
    const clearStart = Number.parseFloat(style.getPropertyValue('--env-slider-clear-start'));
    const clearEnd = Number.parseFloat(style.getPropertyValue('--env-slider-clear-end'));
    const parts = Number(getComputedStyle(root).getPropertyValue('--env-slider-ticks'));
    const texts = [...root.querySelectorAll('.env-slider-label, .env-slider-value')].map((text) => {
      const at = text.getBoundingClientRect();
      const margin = Number.parseFloat(getComputedStyle(text).fontSize) / 2;
      return [at.left - margin - track.left, at.right + margin - track.left];
    });
    const mask = getComputedStyle(root.querySelector('.env-slider-track')!, '::after').maskImage;
    return {
      mask: mask.startsWith('linear-gradient'),
      each: Array.from({ length: parts - 1 }, (_, index) => {
        const at = (track.width * (index + 1)) / parts;
        return {
          underText: texts.some(([start, end]) => at >= start! && at <= end!),
          faint: at < clearStart || at > clearEnd,
        };
      }),
    };
  });
  expect(ticks.mask).toBe(true);
  for (const tick of ticks.each) expect(tick.faint).toBe(tick.underText);
  expect(ticks.each.some((tick) => tick.faint)).toBe(true);
  expect(ticks.each.some((tick) => !tick.faint)).toBe(true);
});

test(
  'a click moves the value to the pointer and leaves the slider at rest under it',
  { tag: '@engines' },
  async ({ page }) => {
    const state = stateOf(page);
    const box = (await state.slider.locator('.env-slider-track').boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height / 2);
    await expect(state.input).toHaveAttribute('aria-valuenow', '70');
    await expectRest(state);
  },
);

test(
  'after a drag and release the handle and ticks go until the pointer leaves and comes back',
  { tag: '@engines' },
  async ({ page }) => {
    const state = stateOf(page);
    const box = (await state.control.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.5, y);
    await page.mouse.down();
    await expect(state.control).toHaveAttribute('data-dragging', '');
    // Dragged under the label, the handle and the fill's end fade there, as on hover.
    await page.mouse.move(box.x + 2, y, { steps: 4 });
    await expect(state.input).toHaveAttribute('aria-valuenow', '0');
    await expect(state.thumb).toHaveCSS('opacity', '0.25');
    await expect.poll(state.ticks).toBe('0.35');
    await expect.poll(state.fillEnd).toBe('1');
    await page.mouse.move(box.x + box.width * 0.6, y, { steps: 4 });
    await expect(state.thumb).toHaveCSS('opacity', '1');
    // Released with the pointer still over the slider: back at rest, and moving over it keeps it so.
    await page.mouse.up();
    await expect(state.control).not.toHaveAttribute('data-dragging');
    await expectRest(state);
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 3 });
    await expectRest(state);
    // The slider keeps focus after the release, which a pointer gave it, so no handle.
    await expect(state.input).toBeFocused();
    // Left and hovered again, they show again.
    await page.mouse.move(box.x + box.width * 0.3, box.y - 40);
    await page.mouse.move(box.x + box.width * 0.3, y);
    await expect(state.control).toHaveAttribute('data-handle', '');
    await expect(state.thumb).toHaveCSS('opacity', '1');
    await expect.poll(state.ticks).toBe('0.35');
    // Released outside the slider, it is at rest, and coming back over it shows them again.
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 4, { steps: 3 });
    await expect.poll(state.ticks).toBe('0.35');
    await page.mouse.up();
    await expectRest(state);
    await page.mouse.move(box.x + box.width * 0.5, y, { steps: 3 });
    await expect(state.control).toHaveAttribute('data-ruler', '');
    // A cancelled pointer and a lost capture end the press as a release does.
    for (const end of ['pointercancel', 'lostpointercapture']) {
      await page.mouse.move(box.x + box.width * 0.5, box.y - 40);
      await page.mouse.move(box.x + box.width * 0.5, y);
      await page.mouse.down();
      await expect(state.control).toHaveAttribute('data-dragging', '');
      await state.control.dispatchEvent(end, { pointerId: 1, bubbles: true });
      await expect(state.control).not.toHaveAttribute('data-dragging');
      await expectRest(state);
      await page.mouse.up();
    }
  },
);

test(
  'keyboard focus shows the handle with the focus ring, faded behind text, and no ticks',
  { tag: '@engines' },
  async ({ page }) => {
    const state = stateOf(page);
    await page.mouse.move(0, 0);
    // Focused as Tab would, which WebKit, like Safari, keeps from range inputs by default.
    await state.input.focus();
    await expect(state.control).toHaveCSS('outline-style', 'solid');
    await expect(state.control).toHaveAttribute('data-handle', '');
    await expect(state.control).not.toHaveAttribute('data-ruler');
    await expect(state.thumb).toHaveCSS('opacity', '1');
    await page.keyboard.press('Home');
    await expect(state.input).toHaveAttribute('aria-valuenow', '0');
    await expect(state.thumb).toHaveCSS('opacity', '0.25');
    await expect.poll(state.fillEnd).toBe('1');
    expect(await state.ticks()).toBe('0');
    // Leaving the slider puts it back at rest.
    await state.input.blur();
    await expectRest(state);
  },
);

test('a finger shows the handle and the ticks only while it is down', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${fixtureUrl}/?fixture=sliders`);
  const state = stateOf(page);
  const box = (await state.control.boundingBox())!;
  const point = { x: Math.round(box.x + box.width * 0.6), y: Math.round(box.y + box.height / 2) };
  const touch = await context.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await expect(state.control).toHaveAttribute('data-handle', '');
  await expect(state.control).toHaveAttribute('data-ruler', '');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(state.control).not.toHaveAttribute('data-dragging');
  await expectRest(state);
  await context.close();
});

test('the fill is empty at the minimum, the whole field at the maximum and in proportion between, in either direction', async ({
  page,
}) => {
  const scope = page.getByTestId('sliders-light');
  for (const direction of ['ltr', 'rtl'] as const) {
    await scope.evaluate((e, dir) => e.setAttribute('dir', dir), direction);
    // Scale, from 50 to 200 by tens: its minimum isn't 0, so the fill follows the range, not the number.
    const slider = scope.locator('.env-slider').nth(2);
    const input = slider.getByRole('slider');
    const control = slider.locator('.env-slider-control');
    const fill = slider.locator('.env-slider-indicator');
    const thumb = slider.locator('.env-slider-thumb');
    await input.focus();
    const box = (await control.boundingBox())!;
    const inset = box.height / 4;
    const start = (x: number, width: number) =>
      direction === 'ltr' ? x - box.x : box.x + box.width - (x + width);
    await page.keyboard.press('Home');
    await expect(input).toHaveAttribute('aria-valuenow', '50');
    await expect(control).toHaveAttribute('data-handle', '');
    await expect.poll(async () => (await fill.boundingBox())?.width ?? 0).toBeLessThanOrEqual(0.5);
    // Nothing paints the fill beyond its box, such as under the rounded start.
    expect(await fill.evaluate((e) => getComputedStyle(e, '::before').content)).toBe('none');
    // The handle keeps clear of the rounded end, inside the field.
    let handle = (await thumb.boundingBox())!;
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(inset, 0);
    await page.keyboard.press('End');
    await expect(input).toHaveAttribute('aria-valuenow', '200');
    await expect
      .poll(async () => {
        const full = (await fill.boundingBox())!;
        return Math.max(Math.abs(full.x - box.x), Math.abs(full.width - box.width));
      })
      .toBeLessThanOrEqual(0.5);
    handle = (await thumb.boundingBox())!;
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(box.width - inset, 0);
    // 80 is a fifth of the way from 50 to 200: a fifth of the field, from the start, with the handle
    // at the fill's end.
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-valuenow', '80');
    await expect
      .poll(async () => {
        const part = (await fill.boundingBox())!;
        return Math.max(Math.abs(start(part.x, part.width)), Math.abs(part.width - box.width / 5));
      })
      .toBeLessThanOrEqual(0.5);
    handle = (await thumb.boundingBox())!;
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(box.width / 5, 0);
  }
});

test('a slider selects no text when dragged or double-clicked, and its label still names it', async ({
  page,
}) => {
  const scope = page.getByTestId('sliders-light');
  const slider = scope.locator('.env-slider').first();
  for (const part of ['.env-slider-control', '.env-slider-label', '.env-slider-value'])
    await expect(slider.locator(part)).toHaveCSS('user-select', 'none');
  const selected = () => page.evaluate(() => window.getSelection()?.toString() ?? '');
  const label = (await slider.locator('.env-slider-label').boundingBox())!;
  await page.mouse.dblclick(label.x + label.width / 2, label.y + label.height / 2);
  expect(await selected()).toBe('');
  const value = (await slider.locator('.env-slider-value').boundingBox())!;
  await page.mouse.dblclick(value.x + value.width / 2, value.y + value.height / 2);
  expect(await selected()).toBe('');
  // A drag along it selects none of its text either.
  const box = (await slider.locator('.env-slider-control').boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  expect(await selected()).not.toMatch(/Opacity|%/);
  await expect(slider.getByRole('slider', { name: 'Opacity' })).toHaveAttribute(
    'aria-valuetext',
    /%$/,
  );
});

/**
 * Where a slider's field and its text are on screen, and how much they show scaled: their width and
 * height on screen over those they are laid out at.
 */
async function boxesOf(slider: ReturnType<Page['locator']>) {
  return slider.evaluate((root) => {
    const box = (selector: string) => {
      const element = root.querySelector(selector)!;
      const { left, right, width, height } = element.getBoundingClientRect();
      const laid = getComputedStyle(element);
      const scaleX = width / Number.parseFloat(laid.width);
      const scaleY = height / Number.parseFloat(laid.height);
      return { left, right, width, height, scaleX, scaleY };
    };
    return {
      field: box('.env-slider-control'),
      label: box('.env-slider-label'),
      value: box('.env-slider-value'),
    };
  });
}

/** Waits two frames, past the one in which a slider would measure a pointer that moved. */
async function nextFrames(page: Page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

test(
  'dragging past an end holds the value there and stretches the slider toward the pointer, a little, until let go',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('sliders-light');
    const slider = scope.locator('.env-slider').first();
    const input = slider.getByRole('slider');
    // Room beside the slider for the pointer to pass its ends, inside the page, where every engine
    // follows it.
    await slider.evaluate((e) => (e.style.marginInline = '320px'));
    for (const [direction, end] of [
      ['ltr', 'right'],
      ['ltr', 'left'],
      ['rtl', 'left'],
    ] as const) {
      await scope.evaluate((e, dir) => e.setAttribute('dir', dir), direction);
      const rest = await boxesOf(slider);
      const { field } = rest;
      // The end the pointer passes, and the value there: the maximum at the end of the reading
      // direction, the minimum at its start.
      const edge = end === 'right' ? field.right : field.left;
      const away = (distance: number) => (end === 'right' ? edge + distance : edge - distance);
      const atEnd = (end === 'right') === (direction === 'ltr') ? '100' : '0';
      const y =
        rest.field.height / 2 + (await slider.locator('.env-slider-control').boundingBox())!.y;
      // A stretch is the length the field gains on the pointer's side, its other end staying put.
      const stretch = async () => {
        const now = (await boxesOf(slider)).field;
        if (end === 'right') expect(now.left).toBeCloseTo(field.left, 1);
        else expect(now.right).toBeCloseTo(field.right, 1);
        return now.width - field.width;
      };
      // Its most: 6% of the length, or half the height where that is less.
      const most = Math.min(field.width * 0.06, field.height / 2);

      await page.mouse.move(field.left + field.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(away(30), y, { steps: 8 });
      await expect(input).toHaveAttribute('aria-valuenow', atEnd);
      await expect.poll(stretch).toBeGreaterThan(2);
      const near = await stretch();
      // It gives less than the pointer travels.
      expect(near).toBeLessThan(30);
      await page.mouse.move(away(280), y, { steps: 8 });
      await expect.poll(stretch).toBeGreaterThan(near);
      const far = await stretch();
      expect(far).toBeLessThanOrEqual(most);
      expect(far).toBeGreaterThan(most * 0.8);
      await expect(input).toHaveAttribute('aria-valuenow', atEnd);
      // It thins a little across, by at most 3%.
      const now = await boxesOf(slider);
      expect(now.field.height).toBeLessThan(field.height);
      expect(now.field.height).toBeGreaterThanOrEqual(field.height * 0.97 - 0.01);
      // The label and the value keep their size, and the text at the end travels with it.
      expect(now.field.scaleX).toBeGreaterThan(1.01);
      for (const part of ['label', 'value'] as const) {
        expect(now[part].scaleX).toBeCloseTo(1, 3);
        expect(now[part].scaleY).toBeCloseTo(1, 3);
      }
      const outer = (box: typeof field) => (end === 'right' ? box.right : box.left);
      const atTheEnd = (end === 'right') === (direction === 'ltr') ? 'value' : 'label';
      expect(Math.abs(outer(now[atTheEnd]) - outer(rest[atTheEnd]))).toBeGreaterThan(far * 0.8);

      // Let go, it springs back to its length, eased rather than at once.
      await page.mouse.up();
      const springs = await slider
        .locator('.env-slider-control')
        .evaluate((e) =>
          e
            .getAnimations()
            .some(
              (animation) =>
                (animation as CSSTransition).transitionProperty === '--env-slider-stretch',
            ),
        );
      expect(springs).toBe(true);
      await slider
        .locator('.env-slider-control')
        .evaluate((e) => Promise.all(e.getAnimations().map((animation) => animation.finished)));
      expect(Math.abs(await stretch())).toBeLessThan(0.05);
      await expect(input).toHaveAttribute('aria-valuenow', atEnd);
    }
  },
);

test(
  'a click at the end, the keyboard and a disabled slider stretch nothing',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('sliders-light');
    const slider = scope.locator('.env-slider').first();
    const input = slider.getByRole('slider');
    const { field } = await boxesOf(slider);
    const control = (await slider.locator('.env-slider-control').boundingBox())!;
    const y = control.y + control.height / 2;
    const width = async (which = slider) => (await boxesOf(which)).field.width;
    await page.mouse.click(field.right - 1, y);
    await expect(input).toHaveAttribute('aria-valuenow', '100');
    await nextFrames(page);
    expect(await width()).toBeCloseTo(field.width, 1);
    for (const key of ['End', 'ArrowRight', 'PageUp', 'Home', 'ArrowLeft']) {
      await page.keyboard.press(key);
      await nextFrames(page);
      expect(await width()).toBeCloseTo(field.width, 1);
    }
    // A disabled slider neither moves nor stretches.
    const balance = scope.locator('.env-slider').nth(3);
    const rest = (await boxesOf(balance)).field;
    const box = (await balance.locator('.env-slider-control').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, { steps: 8 });
    await nextFrames(page);
    expect(await width(balance)).toBeCloseTo(rest.width, 1);
    await page.mouse.up();
    await expect(balance.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
  },
);

test('under reduced motion a drag past the end holds the value but stretches nothing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const slider = page.getByTestId('sliders-light').locator('.env-slider').first();
  const rest = await boxesOf(slider);
  const box = (await slider.locator('.env-slider-control').boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 300, y, { steps: 8 });
  await expect(slider.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
  await nextFrames(page);
  const now = await boxesOf(slider);
  expect(now.field.width).toBeCloseTo(rest.field.width, 1);
  expect(now.field.height).toBeCloseTo(rest.field.height, 1);
  await page.mouse.up();
});
