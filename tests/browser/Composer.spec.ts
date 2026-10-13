import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const composerFixture = `${fixtureUrl}/?fixture=composer`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** The composer root around a field. */
function composerOf(field: Locator) {
  return field.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " env-composer ")][1]',
  );
}

test('Enter submits, Shift+Enter starts a line and the action stops a running reply', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Message light' });
  const composer = composerOf(field);
  const send = composer.getByRole('button', { name: 'Send', exact: true });
  const sent = scope.getByTestId('composer-sent-light');
  await expect(field).toHaveAttribute('placeholder', 'Ask anything');
  await expect(field).toHaveAttribute('enterkeyhint', 'send');
  await expect(send).toHaveAttribute('aria-disabled', 'true');
  await expect(send).toBeDisabled();

  // Blank text never submits, and Enter adds no line to it.
  await field.click();
  await page.keyboard.press('Enter');
  await field.fill('   ');
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('   ');
  await expect(sent).toHaveText('');

  await field.fill('');
  await page.keyboard.type('Quarterly report');
  await page.keyboard.press('Shift+Enter');
  await page.keyboard.type('Second line');
  await expect(field).toHaveValue('Quarterly report\nSecond line');
  await expect(send).toBeEnabled();
  await expect(send).not.toHaveAttribute('aria-disabled');

  await page.keyboard.press('Enter');
  await expect(sent).toHaveText('Quarterly report\nSecond line');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(composer).toHaveAttribute('data-running', 'true');
  const stop = composer.getByRole('button', { name: 'Stop', exact: true });
  await expect(stop).toBeEnabled();
  await expect(stop).toHaveAttribute('title', 'Stop');

  // While running, Enter neither submits nor adds a line; the draft waits.
  await page.keyboard.type('Next question');
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Next question');
  await expect(sent).toHaveText('Quarterly report\nSecond line');

  // Stopping from the keyboard keeps focus on the action, which becomes Send again.
  await page.keyboard.press('Tab');
  await expect(stop).toBeFocused();
  await page.keyboard.press('Space');
  await expect(scope.getByTestId('composer-stops-light')).toHaveText('1');
  await expect(composer).not.toHaveAttribute('data-running');
  await expect(send).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(sent).toHaveText('Quarterly report\nSecond line | Next question');
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('');
  expect(errors).toEqual([]);
});

test('Enter that confirms an input method composition never submits', async ({ page }) => {
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Message light' });
  await field.fill('Aurora');
  const prevented = await field.evaluate((element) => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await expect(scope.getByTestId('composer-sent-light')).toHaveText('');
  await expect(field).toHaveValue('Aurora');
});

for (const sizing of ['native', 'measured'] as const) {
  test(`the field grows with its lines up to the maximum, then scrolls (${sizing})`, async ({
    page,
  }) => {
    if (sizing === 'measured') await withoutContentSizing(page);
    await expectGrowth(page);
    const field = page.getByRole('textbox', { name: 'Message light' });
    expect(await field.evaluate((element) => element.style.blockSize !== '')).toBe(
      sizing === 'measured',
    );
  });
}

/** Browsers without native content sizing for fields measure the text instead. */
async function withoutContentSizing(page: Page) {
  await page.addInitScript(() => {
    const supports = CSS.supports.bind(CSS);
    CSS.supports = ((property: string, value?: string) =>
      property === 'field-sizing'
        ? false
        : value === undefined
          ? supports(property)
          : supports(property, value)) as typeof CSS.supports;
    const style = document.createElement('style');
    style.textContent = '.env-composer-input { field-sizing: fixed !important; }';
    (document.head ?? document.documentElement).append(style);
  });
}

async function expectGrowth(page: Page) {
  await page.goto(composerFixture);
  const field = page.getByRole('textbox', { name: 'Message light' });
  const action = composerOf(field).getByRole('button', { name: 'Send' });
  const height = async () => (await field.boundingBox())!.height;
  const single = await height();
  // One line lines up with the round action beside it.
  expect(single).toBeCloseTo((await action.boundingBox())!.height, 0);
  const lineHeight = await field.evaluate((element) =>
    parseFloat(getComputedStyle(element).lineHeight),
  );
  await field.fill('One\nTwo\nThree');
  await expect.poll(height).toBeCloseTo(single + 2 * lineHeight, 0);
  await field.fill(Array.from({ length: 14 }, (_, index) => `Line ${index + 1}`).join('\n'));
  // Eight rows by default; further lines scroll inside the field.
  await expect.poll(height).toBeCloseTo(single + 7 * lineHeight, 0);
  expect(await field.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await field.fill('');
  await expect.poll(height).toBeCloseTo(single, 0);

  // A composer with two to four rows starts at two and stops at four.
  const note = page.getByRole('textbox', { name: 'Note light' });
  const noteHeight = async () => (await note.boundingBox())!.height;
  await note.fill('');
  const two = await noteHeight();
  expect(two).toBeCloseTo(single + lineHeight, 0);
  await note.fill('1\n2\n3\n4\n5\n6');
  await expect.poll(noteHeight).toBeCloseTo(single + 3 * lineHeight, 0);
  // A narrower field wraps the text onto more lines and grows with them.
  await note.fill('Quarterly report '.repeat(6).trim());
  const wide = await noteHeight();
  await page.setViewportSize({ width: 360, height: 900 });
  await expect.poll(noteHeight).toBeGreaterThan(wide);
}

test('an uncontrolled composer sends from its button, clears and describes the field', async ({
  page,
}) => {
  await page.goto(composerFixture);
  const scope = page.getByTestId('composer-light');
  const field = scope.getByRole('textbox', { name: 'Note light' });
  const composer = composerOf(field);
  await expect(field).toHaveValue('Draft note');
  await expect(field).toHaveAccessibleDescription('Attachments up to 10 MB');
  await expect(composer.getByRole('button', { name: 'Attach files' })).toBeVisible();
  // The action row sits below the field, the start content before the action.
  const fieldBox = (await field.boundingBox())!;
  const attachBox = (await composer.getByRole('button', { name: 'Attach files' }).boundingBox())!;
  const sendBox = (await composer.getByRole('button', { name: 'Send' }).boundingBox())!;
  expect(attachBox.y).toBeGreaterThanOrEqual(fieldBox.y + fieldBox.height - 1);
  expect(Math.abs(attachBox.y - sendBox.y)).toBeLessThan(1);
  expect(attachBox.x).toBeLessThan(sendBox.x);

  await composer.getByRole('button', { name: 'Send' }).click();
  await expect(scope.getByTestId('composer-notes-light')).toHaveText('Draft note');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(composer.getByRole('button', { name: 'Send' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  // A press on the surface around the field places the caret in it.
  await page.getByRole('textbox', { name: 'Message light' }).focus();
  const surface = composer.locator('.env-composer-surface');
  const surfaceBox = (await surface.boundingBox())!;
  await page.mouse.click(surfaceBox.x + surfaceBox.width / 2, surfaceBox.y + 3);
  await expect(field).toBeFocused();

  const disabled = scope.getByRole('textbox', { name: 'Disabled light' });
  await expect(disabled).toBeDisabled();
  await expect(composerOf(disabled).getByRole('button', { name: 'Send' })).toBeDisabled();
});

test('the raised surface keeps its colors, focus and contrast in both themes', async ({ page }) => {
  await page.goto(composerFixture);
  for (const theme of ['light', 'dark']) {
    const field = page.getByRole('textbox', { name: `Message ${theme}` });
    const surface = composerOf(field).locator('.env-composer-surface');
    await field.focus();
    // The outline eases to its focus color.
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).borderTopColor))
      .toBe(
        await surface.evaluate((element) => {
          const probe = document.createElement('span');
          probe.style.color = 'var(--color-field-active)';
          element.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        }),
      );
    const result = await surface.evaluate((element) => {
      const resolve = (property: string, value: string) => {
        const probe = document.createElement('span');
        probe.style.setProperty(property, value);
        element.append(probe);
        const resolved = getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return resolved;
      };
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        popup: resolve('background-color', 'var(--color-popup)'),
        border: style.borderTopColor,
        active: resolve('color', 'var(--color-field-active)'),
        radius: style.borderTopLeftRadius,
        ring: style.boxShadow,
      };
    });
    expect(result.background).toBe(result.popup);
    expect(result.border).toBe(result.active);
    expect(result.radius).toBe('28px');
    expect(result.ring).not.toBe('none');
  }
  // Text, supporting text and the action keep their contrast on the canvas and on panes.
  const failures = await page.evaluate(() => {
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
    const ratio = (background: string[], foreground: string) => {
      const [lighter, darker] = [
        luminance(background),
        luminance([...background, foreground]),
      ].sort((a, b) => b - a);
      return (lighter! + 0.05) / (darker! + 0.05);
    };
    const results: string[] = [];
    for (const composer of document.querySelectorAll<HTMLElement>('.env-composer')) {
      if (composer.hasAttribute('data-disabled')) continue;
      const theme = composer.closest('[data-env-theme]')!.getAttribute('data-env-theme');
      const page = getComputedStyle(
        composer.closest('[data-surface], .env-theme')!,
      ).backgroundColor;
      const surface = composer.querySelector<HTMLElement>('.env-composer-surface')!;
      const fill = getComputedStyle(surface).backgroundColor;
      const input = composer.querySelector<HTMLElement>('.env-composer-input')!;
      const text = ratio([page, fill], getComputedStyle(input).color);
      if (text < 4.5) results.push(`${theme} field text ${text.toFixed(2)}`);
      const footer = composer.querySelector<HTMLElement>('.env-composer-footer');
      if (footer) {
        const supporting = ratio([page], getComputedStyle(footer).color);
        if (supporting < 4.5) results.push(`${theme} footer ${supporting.toFixed(2)}`);
      }
      const action = composer.querySelector<HTMLElement>('.env-composer-action')!;
      if (action.getAttribute('aria-disabled') !== 'true') {
        const actionStyle = getComputedStyle(action);
        const icon = ratio([page, fill, actionStyle.backgroundColor], actionStyle.color);
        if (icon < 3) results.push(`${theme} action icon ${icon.toFixed(2)}`);
      }
    }
    return results;
  });
  expect(failures).toEqual([]);
});

test('composers fit a narrow viewport and wrap long words', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(composerFixture);
  const field = page.getByRole('textbox', { name: 'Message light' });
  await field.fill('A'.repeat(120));
  const composer = composerOf(field);
  const surface = (await composer.locator('.env-composer-surface').boundingBox())!;
  const action = (await composer.getByRole('button', { name: 'Send' }).boundingBox())!;
  expect(action.x + action.width).toBeLessThanOrEqual(surface.x + surface.width);
  expect(await field.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('the action takes the touch size and the field the larger text', async ({ page }) => {
    await page.goto(composerFixture);
    const field = page.getByRole('textbox', { name: 'Message light' });
    const action = composerOf(field).getByRole('button', { name: 'Send' });
    await expect(action).toHaveCSS('width', '44px');
    await expect(action).toHaveCSS('height', '44px');
    await expect(field).toHaveCSS('font-size', '16px');
    expect((await field.boundingBox())!.height).toBeCloseTo(44, 0);
  });
});
