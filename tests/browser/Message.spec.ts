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

test('a busy log reports it while a reply streams in', async ({ page }) => {
  await page.goto(messagesFixture);
  const scope = page.getByTestId('messages-light');
  const log = scope.getByRole('log', { name: 'Pane conversation light', exact: true });
  await expect(log).not.toHaveAttribute('aria-busy');
  await scope.getByRole('button', { name: 'Start reply light' }).click();
  // While busy, assistive technology can wait instead of announcing each step of the reply.
  await expect(log).toHaveAttribute('aria-busy', 'true');
  await expect(log).toHaveAttribute('aria-live', 'polite');
  await expect(log.getByRole('article').last()).toContainText('The summary');
  await scope.getByRole('button', { name: 'Finish reply light' }).click();
  await expect(log).not.toHaveAttribute('aria-busy');
  await expect(log.getByRole('article').last()).toContainText('The summary is ready.');
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
    const icon = (await copy.locator('.env-icon').boundingBox())!;
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

  test('message actions grow to the touch height', async ({ page }) => {
    await page.goto(messagesFixture);
    const copy = page.getByTestId('messages-light').getByRole('button', { name: 'Copy answer' });
    // Like every button, an action is 2.75 rem tall and wide, and its box is its hit area.
    await expect(copy).toHaveCSS('width', '44px');
    await expect(copy).toHaveCSS('height', '44px');
  });
});

test('message actions are small on a fine pointer', async ({ page }) => {
  await page.goto(messagesFixture);
  const copy = page.getByTestId('messages-light').getByRole('button', { name: 'Copy answer' });
  await expect(copy).toHaveCSS('width', '32px');
  await expect(copy).toHaveCSS('height', '32px');
  // A text icon action at the start lines its icon up with the message's edge.
  await expect(copy).toHaveCSS('margin-inline-start', '-8px');
});

test('actions without a variant or size of their own are small ghost buttons', async ({ page }) => {
  await page.goto(messagesFixture);
  const list = page.getByRole('log', { name: 'Defaults light' });
  for (const name of ['Copy note light', 'Reply']) {
    const button = list.getByRole('button', { name });
    await expect(button).toHaveAttribute('data-variant', 'ghost');
    await expect(button).toHaveAttribute('data-size', 'sm');
  }
  // A ghost icon action keeps its round hit area at the edge.
  await expect(list.getByRole('button', { name: 'Copy note light' })).toHaveCSS(
    'margin-inline-start',
    '0px',
  );
});
