import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=adoption`;

/**
 * Installs the page's clock and stops it, so a timer runs only as far as the test moves it, however
 * long the steps between take on a busy engine. An installed clock still runs on its own; pausing it
 * is what stops it. Event timestamps, which ConfirmButton's guard against a double press reads,
 * follow it too.
 */
async function stopClock(page: Page) {
  const start = Date.now();
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start + 1000);
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('LinkProvider routes destinations and leaves disabled links native', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(fixture);
  const projects = page.getByTestId('router-button');
  await expect(projects).toHaveAttribute('data-router-link', '');
  await projects.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/projects');
  await expect(page).toHaveURL(/fixture=adoption$/);
  const disabled = page.getByTestId('disabled-link');
  await expect(disabled).not.toHaveAttribute('data-router-link');
  await expect(disabled).not.toHaveAttribute('href');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test('AvatarButton shows a halo on hover and while its menu is open, and names the account', async ({
  page,
}) => {
  await page.goto(fixture);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await trigger.hover();
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.env-tooltip')).toContainText('alex@example.com');
  await trigger.click();
  await expect(page.getByRole('menu', { name: 'Account', exact: true })).toBeVisible();
  await page.mouse.move(1, 1);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('AvatarButton grows to the touch height around a small avatar', async ({ page }) => {
    await page.goto(fixture);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const trigger = page.getByRole('button', { name: 'Open account menu' });
    await expect(trigger).toHaveCSS('width', '44px');
    await expect(trigger).toHaveCSS('height', '44px');
  });
});

test('a pending button keeps its size and name, reports busy and ignores presses', async ({
  page,
  browserName,
}) => {
  await page.goto(fixture);
  const button = page.getByTestId('pending-button');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button.locator('.env-spinner')).toBeVisible();
  await expect(button.locator('.env-button-content')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
  await button.click({ force: true });
  await expect(page.getByTestId('pending-presses')).toHaveText('0');
  await expect(page.getByRole('progressbar', { name: 'Refreshing seats' })).toBeVisible();
  if (browserName === 'chromium') {
    // The browser's own accessibility tree, which drops visually hidden text, still names it.
    const session = await page.context().newCDPSession(page);
    const { root } = await session.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '[data-testid="pending-button"]',
    });
    const { nodes } = await session.send('Accessibility.getPartialAXTree', {
      nodeId,
      fetchRelatives: false,
    });
    expect(nodes[0].name?.value).toBe('Save changes');
  }
});

test('ConfirmButton names the consequence and runs only on a deliberate second press', async ({
  page,
}) => {
  const errors = collectErrors(page);
  // The fixture's buttons disarm after 800 ms, a timer on the stopped clock.
  await stopClock(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-button');
  const confirmed = page.getByTestId('confirmed');
  const status = page.locator('.env-confirm-button-status').first();
  await expect(button).toHaveText('Remove');
  await expect(button).toHaveAttribute('data-variant', 'outline');

  await button.click();
  await expect(button).toHaveText('Remove Morgan?');
  await expect(button).toHaveAttribute('data-tone', 'danger');
  await expect(status).toHaveText('Remove Morgan? Press again to confirm.');
  await page.clock.runFor(450);
  await button.click();
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveText('Remove');
  await expect(status).toHaveText('');

  // A double click only arms it.
  await button.dblclick();
  await expect(button).toHaveText('Remove Morgan?');
  await expect(confirmed).toHaveText('1');
  // Escape, leaving the button and waiting all disarm it.
  await button.press('Escape');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan?');
  await page.keyboard.press('Tab');
  await expect(button).toHaveText('Remove');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('Remove Morgan?');
  await page.clock.runFor(800);
  await expect(button).toHaveText('Remove');
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('an icon-only ConfirmButton is round at rest and names the consequence when armed', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await stopClock(page);
  await page.goto(fixture);
  const button = page.getByTestId('confirm-icon-button');
  const confirmed = page.getByTestId('confirmed');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toHaveAttribute('data-variant', 'secondary');
  const rest = (await button.boundingBox())!;
  expect(rest.width).toBeCloseTo(40, 0);
  expect(rest.height).toBeCloseTo(40, 0);
  // Round like IconButton: the corners take at least half the height.
  expect(
    await button.evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius)),
  ).toBeGreaterThanOrEqual(20);

  // Keyboard arming keeps focus on the button while it grows to name the consequence.
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAccessibleName('Remove Morgan?');
  await expect(button).toHaveText('Remove Morgan?');
  await expect(button).toHaveAttribute('data-tone', 'danger');
  await expect(button).not.toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();
  await expect(button.locator('.env-icon')).toHaveCount(1);
  expect((await button.boundingBox())!.width).toBeGreaterThan(rest.width + 40);
  await expect(page.locator('.env-confirm-button-status').nth(1)).toHaveText(
    'Remove Morgan? Press again to confirm.',
  );
  await page.clock.runFor(450);
  await page.keyboard.press('Enter');
  await expect(confirmed).toHaveText('1');
  await expect(button).toHaveAccessibleName('Remove Morgan');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(button).toBeFocused();

  await button.click();
  await expect(button).toHaveText('Remove Morgan?');
  await button.press('Escape');
  await expect(button).toHaveClass(/env-icon-button/);
  await expect(confirmed).toHaveText('1');
  expect(errors).toEqual([]);
});

test('motion settles presses and respects reduced motion', async ({ page }) => {
  await page.goto(fixture);
  const skeleton = page.locator('.env-skeleton').first();
  await expect(skeleton).toHaveCSS('animation-name', 'env-motion-pulse');
  const button = page.getByTestId('router-button');
  await button.hover();
  await page.mouse.down();
  await expect(button).not.toHaveCSS('transform', 'none');
  await page.mouse.up();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(skeleton).toHaveCSS('animation-name', 'none');
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.up();
});
