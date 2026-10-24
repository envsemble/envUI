import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

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
  // Keyboard focus rings the whole field and shows the handle, faint at 0, under the label.
  await expect(scope.locator('.env-slider-control').first()).toHaveCSS('outline-style', 'solid');
  await expect(scope.locator('.env-slider-thumb').first()).toHaveCSS('opacity', '0.25');

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
  // The fill runs from the slider's own start to the value, 40% of the way along the track.
  const fill = slider.locator('.env-slider-indicator');
  const fillStart = await fill.evaluate(
    (e) =>
      e.getBoundingClientRect().left -
      e.closest('.env-slider-control')!.getBoundingClientRect().left +
      Number.parseFloat(getComputedStyle(e, '::before').inlineSize) * -1,
  );
  expect(Math.abs(fillStart)).toBeLessThanOrEqual(1);
  // At rest the handle and the ticks are out of sight; under the pointer they show.
  const thumb = slider.locator('.env-slider-thumb');
  const ticks = () =>
    slider.locator('.env-slider-track').evaluate((e) => getComputedStyle(e, '::after').opacity);
  await page.mouse.move(0, 0);
  await expect(thumb).toHaveCSS('opacity', '0');
  expect(await ticks()).toBe('0');
  await control.hover();
  await expect(thumb).toHaveCSS('opacity', '1');
  await expect.poll(ticks).not.toBe('0');
  // The text never dims: where the handle and the fill's end pass under the label or the value,
  // they fade instead, and the text above them keeps its full color.
  const heading = slider.locator('.env-slider-heading');
  const veil = () =>
    control.evaluate((e) => getComputedStyle(e).getPropertyValue('--env-slider-veil').trim());
  const fillEnd = () => fill.evaluate((e) => getComputedStyle(e, '::after').opacity);
  expect(await veil()).toBe('0');
  expect(await fillEnd()).toBe('0');
  const input = slider.getByRole('slider');
  await input.focus();
  await page.keyboard.press('Home');
  await expect.poll(veil).toBe('1');
  await expect(thumb).toHaveCSS('opacity', '0.25');
  await expect.poll(fillEnd).toBe('1');
  await page.keyboard.press('End');
  await expect.poll(veil).toBe('1');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await expect.poll(veil).toBe('0');
  await expect(thumb).toHaveCSS('opacity', '1');
  for (const part of [heading, slider.locator('.env-slider-label'), value]) {
    await expect(part).toHaveCSS('opacity', '1');
    await expect(part).toHaveCSS('mask-image', 'none');
  }
  // Ten parts of 0 to 100 by large steps of 10; a range of few steps is cut at every step.
  await expect(slider).toHaveCSS('--env-slider-ticks', '10');
});
