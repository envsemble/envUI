import { test, expect, type JSHandle, type Locator, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fixtureUrl } from './helpers/Servers';

const themes = ['light', 'dark'] as const;
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

/** Files as the browser hands them to a drop, with a name and a type each. */
function filesTransfer(page: Page, files: Array<[name: string, type: string]>) {
  return page.evaluateHandle((list) => {
    const transfer = new DataTransfer();
    for (const [name, type] of list) transfer.items.add(new File(['content'], name, { type }));
    return transfer;
  }, files);
}

async function drop(target: Locator, dataTransfer: JSHandle<DataTransfer>) {
  await target.dispatchEvent('dragenter', { dataTransfer });
  await target.dispatchEvent('dragover', { dataTransfer });
  await target.dispatchEvent('drop', { dataTransfer });
}

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

/** The color a token resolves to inside the element's theme. */
async function tokenColor(element: Locator, token: string) {
  return element.evaluate((node, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    node.closest('.env-theme')!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Playwright catches file pickers only while a filechooser listener is on, and turns that on
  // without waiting as a listener is added. Kept on for the whole test, a press right after a
  // waitForEvent('filechooser') can't open a real picker, which headless Chromium cancels at once.
  page.on('filechooser', () => {});
  await page.goto(`${fixtureUrl}/?fixture=drop-zones`);
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('the zone is a button named by its visible text that opens the file picker', async ({
  page,
}) => {
  const scope = page.getByTestId('drop-zones-light');
  // The name is what the zone shows, its label and then its description, so speech input finds it.
  const zone = scope.getByRole('button', {
    name: 'Drop a logo here, or browse PNG, JPG or WebP up to 2 MB',
    exact: true,
  });
  await expect(zone).toHaveAccessibleDescription('');
  // The zone is the first tab stop; keyboard focus shows the focus ring around it.
  await page.keyboard.press('Tab');
  await expect(zone).toBeFocused();
  await expect(zone).toHaveCSS('outline-style', 'solid');
  await expect(zone).toHaveCSS('outline-color', await tokenColor(zone, '--env-color-border-focus'));
  const input = scope.locator('input[type="file"]').first();
  await expect(input).toBeHidden();
  await expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,.webp');

  const chooser = page.waitForEvent('filechooser');
  await zone.click();
  const picker = await chooser;
  expect(picker.isMultiple()).toBe(false);
  await picker.setFiles({ name: 'logo.png', mimeType: 'image/png', buffer: pixel });
  await expect(page.getByTestId('taken-light')).toHaveText('logo.png');

  // The keyboard opens the picker as well; closing it without files changes nothing.
  for (const key of ['Enter', 'Space']) {
    await zone.focus();
    const next = page.waitForEvent('filechooser');
    await page.keyboard.press(key);
    await (await next).setFiles([]);
  }
  await expect(page.getByTestId('taken-light')).toHaveText('logo.png');

  const documents = scope.getByRole('button', { name: 'Attach documents' });
  const multiple = page.waitForEvent('filechooser');
  await documents.click();
  const several = await multiple;
  expect(several.isMultiple()).toBe(true);
  await several.setFiles([
    { name: 'brief.pdf', mimeType: 'application/pdf', buffer: pixel },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: pixel },
  ]);
  await expect(page.getByTestId('documents-light')).toHaveText('brief.pdf notes.txt');
});

test(
  'dropped files show the drag-over state and are filtered by accept',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('drop-zones-light');
    const zone = scope.getByRole('button', { name: /^Drop a logo here, or browse/ });
    const root = scope.locator('.env-drop-zone').first();
    const transfer = await filesTransfer(page, [
      ['logo.webp', 'image/webp'],
      ['notes.txt', 'text/plain'],
      ['mark.png', 'image/png'],
    ]);
    await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
    await expect(root).toHaveAttribute('data-drag-over', '');
    await expect(zone).toHaveCSS('border-top-style', 'solid');
    await expect(zone).toHaveCSS(
      'border-top-color',
      await tokenColor(zone, '--env-color-border-accent-emphasis'),
    );
    // Moving over the label inside keeps the state until the files leave the zone.
    const label = zone.locator('.env-drop-zone-label');
    await label.dispatchEvent('dragenter', { dataTransfer: transfer });
    await zone.dispatchEvent('dragleave', { dataTransfer: transfer });
    await expect(root).toHaveAttribute('data-drag-over', '');
    await label.dispatchEvent('dragleave', { dataTransfer: transfer });
    await expect(root).not.toHaveAttribute('data-drag-over');

    await drop(zone, transfer);
    await expect(root).not.toHaveAttribute('data-drag-over');
    // Without multiple the zone takes the first matching file and rejects the others.
    await expect(page.getByTestId('taken-light')).toHaveText('logo.webp');
    await expect(page.getByTestId('rejected-light')).toHaveText('notes.txt mark.png');

    await drop(scope.getByRole('button', { name: 'Attach documents' }), transfer);
    await expect(page.getByTestId('documents-light')).toHaveText('logo.webp notes.txt mark.png');
  },
);

test('a pending zone reports that it is busy and a disabled one takes no files', async ({
  page,
}) => {
  const scope = page.getByTestId('drop-zones-light');
  const pending = scope.getByRole('button', { name: 'Uploading the logo' });
  await expect(pending).toHaveAttribute('aria-busy', 'true');
  await expect(pending).toHaveAttribute('aria-disabled', 'true');
  await expect(pending.locator('.env-spinner')).toBeVisible();
  let opened = false;
  page.on('filechooser', () => {
    opened = true;
  });
  // Pressing it anyway opens nothing.
  await pending.click({ force: true });
  const transfer = await filesTransfer(page, [['logo.png', 'image/png']]);
  await drop(pending, transfer);
  await expect(scope.locator('.env-drop-zone').nth(2)).not.toHaveAttribute('data-drag-over');

  const disabled = scope.getByRole('button', { name: 'Uploads are paused' });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS('opacity', '0.48');
  await drop(scope.locator('.env-drop-zone').nth(3), transfer);
  expect(opened).toBe(false);
  await expect(page.getByTestId('unavailable-light')).toHaveText('');
});

test('an error is linked to the zone and colors its outline in both themes', async ({ page }) => {
  for (const theme of themes) {
    const scope = page.getByTestId(`drop-zones-${theme}`);
    const cover = scope.getByRole('button', { name: 'Drop a cover image' });
    await expect(cover).toHaveAccessibleDescription('Choose an image at least 1200 pixels wide.');
    await expect(cover).toHaveCSS(
      'border-top-color',
      await tokenColor(cover, '--env-color-fg-danger'),
    );
    await expect(cover).toHaveCSS('border-top-style', 'dashed');
    const texts = scope.locator(
      '.env-drop-zone-label, .env-drop-zone-description, .env-field-error',
    );
    // Seven labels, four descriptions and one error in each theme.
    await expect(texts).toHaveCount(12);
    for (const text of await texts.all()) {
      if (await text.evaluate((element) => element.closest('button')?.disabled ?? false)) continue;
      expect(await paintedContrast(text), `${theme} ${await text.textContent()}`).toBeGreaterThan(
        4.5,
      );
    }
  }
});

test(
  'a named zone submits the files it took with a native form',
  { tag: '@engines' },
  async ({ page }) => {
    const scope = page.getByTestId('drop-zones-light');
    const attachments = scope.getByRole('button', { name: 'Add attachments' });
    const submitted = page.getByTestId('files-submitted-light');
    await drop(
      attachments,
      await filesTransfer(page, [
        ['report.pdf', 'application/pdf'],
        ['photo.png', 'image/png'],
        ['notes.txt', 'text/plain'],
      ]),
    );
    await scope.getByRole('button', { name: 'Submit files' }).click();
    await expect(submitted).toHaveText('report.pdf notes.txt');

    // Choosing the same file from disk again hands it over again; the form submits it once.
    const summary = test.info().outputPath('summary.pdf');
    await writeFile(summary, pixel);
    for (const attempt of [1, 2]) {
      const chooser = page.waitForEvent('filechooser');
      await attachments.click();
      await (await chooser).setFiles(summary);
      await expect(scope.getByTestId('attached-light')).toHaveText(
        ['report.pdf notes.txt', ...Array(attempt).fill('summary.pdf')].join(' | '),
      );
    }
    await scope.getByRole('button', { name: 'Submit files' }).click();
    await expect(submitted).toHaveText('summary.pdf');

    // Files the zone rejects leave the files it holds as they were.
    await drop(attachments, await filesTransfer(page, [['photo.png', 'image/png']]));
    await scope.getByRole('button', { name: 'Submit files' }).click();
    await expect(submitted).toHaveText('summary.pdf');

    await scope.getByRole('button', { name: 'Reset files' }).click();
    await scope.getByRole('button', { name: 'Submit files' }).click();
    await expect(submitted).toHaveText('');
    await drop(attachments, await filesTransfer(page, [['photo.png', 'image/png']]));
    await scope.getByRole('button', { name: 'Submit files' }).click();
    await expect(submitted).toHaveText('');
  },
);

test('an application shows the chosen image with replace and remove actions', async ({ page }) => {
  const scope = page.getByTestId('drop-zones-light');
  const zone = scope.getByRole('button', { name: 'Drop an avatar here, or browse' });
  const chooser = page.waitForEvent('filechooser');
  await zone.click();
  await (await chooser).setFiles({ name: 'aurora.png', mimeType: 'image/png', buffer: pixel });
  await expect(zone).toBeHidden();
  const preview = scope.locator('.fixture-file-preview');
  await expect(preview.getByText('aurora.png')).toBeVisible();
  await expect(preview.locator('img')).toHaveJSProperty('naturalWidth', 1);

  // Replace opens the zone's file picker through inputRef while the zone is hidden.
  const replace = page.waitForEvent('filechooser');
  await preview.getByRole('button', { name: 'Replace' }).click();
  await (await replace).setFiles({ name: 'mira.png', mimeType: 'image/png', buffer: pixel });
  await expect(preview.getByText('mira.png')).toBeVisible();
  // The form submits the file the application keeps.
  const submit = scope.getByRole('button', { name: 'Submit avatar' });
  const submitted = scope.getByTestId('avatar-submitted-light');
  await submit.click();
  await expect(submitted).toHaveText('mira.png');
  // A form reset keeps the file the application still shows.
  await scope.getByRole('button', { name: 'Reset avatar' }).click();
  await submit.click();
  await expect(submitted).toHaveText('mira.png');
  await preview.getByRole('button', { name: 'Remove' }).click();
  await expect(zone).toBeVisible();
  await expect(preview).toHaveCount(0);
  await submit.click();
  await expect(submitted).toHaveText('');

  // The same file can be chosen again after removing it.
  const again = page.waitForEvent('filechooser');
  await zone.click();
  await (await again).setFiles({ name: 'mira.png', mimeType: 'image/png', buffer: pixel });
  await expect(preview.getByText('mira.png')).toBeVisible();
  await submit.click();
  await expect(submitted).toHaveText('mira.png');
});

test('drop zones fit a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scope = page.getByTestId('drop-zones-light');
  const zone = (await scope.getByRole('button', { name: /^Drop a logo/ }).boundingBox())!;
  expect(zone.x + zone.width).toBeLessThanOrEqual(390);
  const compact = scope.getByRole('button', { name: 'Attach documents' });
  const icon = (await compact.locator('.env-drop-zone-icon').boundingBox())!;
  const text = (await compact.locator('.env-drop-zone-text').boundingBox())!;
  // A compact zone keeps its icon beside the text, centered on it.
  expect(text.x).toBeGreaterThan(icon.x + icon.width);
  expect(Math.abs(icon.y + icon.height / 2 - (text.y + text.height / 2))).toBeLessThan(1);
});
