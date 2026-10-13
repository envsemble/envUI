import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const messagesFixture = `${fixtureUrl}/?fixture=messages`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('a conversation is a polite log of articles with authors, status and actions', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(messagesFixture);
  const scope = page.getByTestId('messages-light');
  const log = scope.getByRole('log', { name: 'Conversation light', exact: true });
  await expect(log).toHaveAttribute('aria-live', 'polite');
  const messages = log.getByRole('article');
  await expect(messages).toHaveCount(5);
  await expect(messages.nth(0)).toHaveAttribute('data-from', 'self');
  await expect(messages.nth(1)).toHaveAttribute('data-from', 'other');
  await expect(messages.nth(1).locator('.env-message-author')).toHaveText('Aurora');
  await expect(messages.nth(1).locator('.env-message-meta')).toHaveText('09:41');
  // Plain text keeps its line breaks.
  await expect(messages.nth(0).locator('.env-message-content')).toHaveCSS(
    'white-space',
    'pre-wrap',
  );
  expect(
    (await messages.nth(0).locator('.env-message-content').boundingBox())!.height,
  ).toBeGreaterThan(40);

  // A status names itself in text beside its icon, not by color alone.
  await expect(messages.nth(2)).toHaveAttribute('data-status', 'sending');
  await expect(messages.nth(2).locator('.env-message-status')).toHaveText('Sending');
  await expect(messages.nth(2).locator('.env-spinner')).toHaveAttribute('aria-hidden', 'true');
  await expect(messages.nth(3)).toHaveAttribute('data-status', 'failed');
  await expect(messages.nth(3).locator('.env-message-status')).toHaveText('Not sent');
  await expect(messages.nth(4).locator('.env-message-status')).toHaveText('Could not deliver');

  await messages.nth(1).getByRole('button', { name: 'Copy answer' }).click();
  await expect(scope.getByTestId('messages-copied-light')).toHaveText('1');
  await messages.nth(3).getByRole('button', { name: 'Retry' }).click();
  await expect(scope.getByTestId('messages-retried-light')).toHaveText('1');

  // A message sent from the composer joins the end of the log.
  const reply = scope.getByRole('textbox', { name: 'Reply light' });
  await reply.fill('Thanks, Aurora');
  await reply.press('Enter');
  await expect(messages).toHaveCount(6);
  await expect(messages.last()).toHaveText('Thanks, Aurora');
  expect(errors).toEqual([]);
});

test('own messages are bubbles at the inline end; others fill the width', async ({ page }) => {
  await page.goto(messagesFixture);
  for (const theme of ['light', 'dark']) {
    const log = page.getByRole('log', { name: `Conversation ${theme}`, exact: true });
    const box = (await log.boundingBox())!;
    const own = log.getByRole('article').nth(0).locator('.env-message-content');
    const answer = log.getByRole('article').nth(1).locator('.env-message-content');
    const ownBox = (await own.boundingBox())!;
    const answerBox = (await answer.boundingBox())!;
    expect(ownBox.x + ownBox.width).toBeCloseTo(box.x + box.width, 0);
    expect(ownBox.width).toBeLessThanOrEqual(box.width * 0.75 + 1);
    expect(answerBox.x).toBeCloseTo(box.x, 0);
    expect(answerBox.width).toBeCloseTo(box.width, 0);
    await expect(own).toHaveCSS('border-top-left-radius', '16px');
    await expect(answer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // Own icon actions line their icons up with the edge of the message.
    const copy = log.getByRole('button', { name: 'Copy answer' });
    const icon = (await copy.locator('.env-symbol').boundingBox())!;
    expect(icon.x).toBeCloseTo(answerBox.x, 0);
  }

  // Right-to-left text puts own messages on the left.
  const log = page.getByRole('log', { name: 'Conversation light', exact: true });
  await log.evaluate((element) => element.setAttribute('dir', 'rtl'));
  const box = (await log.boundingBox())!;
  const own = (await log
    .getByRole('article')
    .nth(0)
    .locator('.env-message-content')
    .boundingBox())!;
  expect(own.x).toBeCloseTo(box.x, 0);
});

test('bubbles, text and status keep their contrast on the canvas and panes in both themes', async ({
  page,
}) => {
  await page.goto(messagesFixture);
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
    const ratio = (back: string[], front: string[]) => {
      const [lighter, darker] = [luminance(back), luminance([...back, ...front])].sort(
        (a, b) => b - a,
      );
      return (lighter! + 0.05) / (darker! + 0.05);
    };
    const results: string[] = [];
    for (const message of document.querySelectorAll<HTMLElement>('.env-message')) {
      const theme = message.closest('[data-env-theme]')!.getAttribute('data-env-theme');
      const surface = message.closest<HTMLElement>('[data-surface]')!;
      const page = getComputedStyle(surface.closest('.env-theme')!).backgroundColor;
      const ground = [page, getComputedStyle(surface).backgroundColor];
      const content = message.querySelector<HTMLElement>('.env-message-content')!;
      const fill = getComputedStyle(content).backgroundColor;
      const where = `${theme} ${surface.dataset.surface} ${message.dataset.from}`;
      if (message.dataset.from === 'self') {
        // The bubble stands apart from the surface it sits on.
        const bubble = ratio(ground, [fill]);
        if (bubble < 1.08) results.push(`${where} bubble ${bubble.toFixed(3)}`);
      }
      const text = ratio([...ground, fill], [getComputedStyle(content).color]);
      if (text < 4.5) results.push(`${where} text ${text.toFixed(2)}`);
      for (const part of message.querySelectorAll<HTMLElement>(
        '.env-message-meta, .env-message-status',
      )) {
        const value = ratio(ground, [getComputedStyle(part).color]);
        if (value < 4.5) results.push(`${where} ${part.className} ${value.toFixed(2)}`);
      }
    }
    return results;
  });
  expect(failures).toEqual([]);
});

test('messages stay readable in a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(messagesFixture);
  const log = page.getByRole('log', { name: 'Conversation light', exact: true });
  const box = (await log.boundingBox())!;
  for (const content of await log.locator('.env-message-content').all()) {
    const contentBox = (await content.boundingBox())!;
    expect(contentBox.x).toBeGreaterThanOrEqual(box.x - 1);
    expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(box.x + box.width + 1);
    expect(await content.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
  }
  // Bubbles may use most of a narrow column.
  const own = (await log.locator('.env-message-content').first().boundingBox())!;
  expect(own.width).toBeGreaterThan(box.width * 0.6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('message actions take the touch size', async ({ page }) => {
    await page.goto(messagesFixture);
    const copy = page.getByTestId('messages-light').getByRole('button', { name: 'Copy answer' });
    await expect(copy).toHaveCSS('width', '44px');
    await expect(copy).toHaveCSS('height', '44px');
  });
});

test('message actions are compact on a fine pointer', async ({ page }) => {
  await page.goto(messagesFixture);
  const copy = page.getByTestId('messages-light').getByRole('button', { name: 'Copy answer' });
  await expect(copy).toHaveCSS('width', '32px');
  await expect(copy).toHaveCSS('height', '32px');
});
