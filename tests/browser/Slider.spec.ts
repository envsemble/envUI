import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const themes = ['light', 'dark'] as const;

/** Luminance contrast between two painted colors. */
async function contrast(element: Locator, foreground: string, background: string) {
  return element.evaluate(
    (node, [front, back]) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const luminance = (colors: string[]) => {
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
      const canvasColor = getComputedStyle(node.closest('.env-theme')!).backgroundColor;
      const [lighter, darker] = [
        luminance([canvasColor, back!]),
        luminance([canvasColor, back!, front!]),
      ].sort((a, b) => b - a);
      return (lighter! + 0.05) / (darker! + 0.05);
    },
    [foreground, background],
  );
}

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
  // Pressing the label moves focus to the slider.
  await scope.getByText('Opacity', { exact: true }).click();
  await expect(opacity).toBeFocused();
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
  // The thumb shows the focus ring while it has keyboard focus.
  const thumb = scope.locator('.env-slider-thumb').first();
  await expect(thumb).toHaveCSS('outline-style', 'solid');

  // Steps follow step and the range; the large step is a tenth of the range.
  const scale = scope.getByRole('slider', { name: 'Scale' });
  await scale.focus();
  await page.keyboard.press('ArrowRight');
  await expect(scale).toHaveAttribute('aria-valuenow', '110');
  await page.keyboard.press('PageUp');
  await expect(scale).toHaveAttribute('aria-valuenow', '130');
  await expect(scope.locator('output.env-slider-value').nth(2)).toHaveText('130');
});

test('pressing the track and dragging the thumb set the value and commit it once', async ({
  page,
}) => {
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
});

test('sliders submit their value with a form and restore it on reset', async ({ page }) => {
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
});

test('the thumb, indicator and value keep their contrast in both themes', async ({ page }) => {
  for (const theme of themes) {
    const scope = page.getByTestId(`sliders-${theme}`);
    const thumb = scope.locator('.env-slider-thumb').first();
    const thumbColor = await thumb.evaluate((element) => getComputedStyle(element).backgroundColor);
    const indicatorColor = await scope
      .locator('.env-slider-indicator')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(indicatorColor).toBe(thumbColor);
    // The thumb and indicator stand out from the canvas as controls (3:1).
    expect(await contrast(thumb, thumbColor, 'transparent')).toBeGreaterThanOrEqual(3);
    const value = scope.locator('output.env-slider-value').first();
    const valueColor = await value.evaluate((element) => getComputedStyle(element).color);
    expect(await contrast(value, valueColor, 'transparent')).toBeGreaterThanOrEqual(4.5);
    const label = scope.locator('.env-slider-label').first();
    const labelColor = await label.evaluate((element) => getComputedStyle(element).color);
    expect(await contrast(label, labelColor, 'transparent')).toBeGreaterThanOrEqual(4.5);
  }
});

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

test('coarse pointers get a taller control and a larger thumb', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Touch emulation with a coarse pointer is Chromium only.');
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${fixtureUrl}/?fixture=sliders`);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const scope = page.getByTestId('sliders-light');
  await expect(scope.locator('.env-slider-control').first()).toHaveCSS('height', '44px');
  await expect(scope.locator('.env-slider-thumb').first()).toHaveCSS('width', '24px');
  const target = await scope
    .locator('.env-slider-thumb')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return [style.content, style.position];
    });
  expect(target).toEqual(['""', 'absolute']);
  await context.close();
});
