import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const fixture = `${fixtureUrl}/?fixture=relative-times`;
const opened = new Date('2026-10-14T09:00:00Z').getTime();

test.use({ locale: 'en-US', timezoneId: 'UTC' });

// Every test runs on a fake clock from the same moment, so no text depends on how long a page
// takes to load.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: opened });
});

test('relative times read naturally for past and coming moments and keep up with the clock', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('relative-times-light');
  await expect(scope.getByTestId('hours-ago')).toBeVisible();
  // Hold the clock ten seconds after the fixture opened.
  await page.clock.pauseAt(opened + 10_000);
  const text = async () =>
    Object.fromEntries(
      await scope
        .locator('time[data-testid]')
        .evaluateAll((times) => times.map((time) => [time.dataset.testid, time.textContent])),
    );
  await expect.poll(text).toMatchObject({
    'seconds-ago': 'just now',
    'seconds-ahead': 'now',
    'minutes-ago': '2 minutes ago',
    'hours-ago': '3 hours ago',
    'days-ahead': 'in 2 days',
    'weeks-ago': '2 weeks ago',
    'from-string': 'in 5 days',
    fixed: 'in 2 days',
  });
  // Twenty seconds later the second ticks have moved both moments past the threshold.
  await page.clock.fastForward(20_000);
  await expect.poll(text).toMatchObject({
    'seconds-ago': '1 minute ago',
    'seconds-ahead': 'just now',
    'hours-ago': '3 hours ago',
  });
  // Half an hour later the minute ticks have rounded the hours up.
  await page.clock.fastForward('31:00');
  await expect.poll(text).toMatchObject({
    'seconds-ago': '32 minutes ago',
    'hours-ago': '4 hours ago',
    'days-ahead': 'in 2 days',
    fixed: 'in 2 days',
  });
  // A fixed now keeps its text, whatever the clock says.
  await expect(scope.getByTestId('fixed')).toHaveText('in 2 days');
  await expect(scope.getByTestId('fixed-german')).toHaveText('in 2 Tagen');
});

test('a time follows a new value with the shared clock', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('relative-times-light');
  const saved = scope.getByTestId('saved');
  await expect(saved).toHaveText('2 hours ago');
  await scope.getByRole('button', { name: 'Save draft light' }).click();
  await expect(saved).toHaveText('just now');
  // The new moment ticks with the others.
  await page.clock.pauseAt(opened + 2 * 60_000);
  await expect(saved).toHaveText('2 minutes ago');
  await page.clock.fastForward('10:00');
  await expect(saved).toHaveText('12 minutes ago');
});

test('formats, languages and the time element', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('relative-times-light');
  await expect(scope.getByTestId('hours-ago')).toBeVisible();
  await page.clock.pauseAt(opened + 10_000);
  await expect(scope.getByTestId('short')).toHaveText('3 hr. ago');
  await expect(scope.getByTestId('narrow')).toHaveText('in 2d');
  await expect(scope.getByTestId('german')).toHaveText('vor 3 Stunden');
  await expect(scope.getByTestId('german-now')).toHaveText('jetzt');
  await expect(scope.getByTestId('labelled-now')).toHaveText('moments ago');
  // EnvUIProvider's locale and now message; a time's own locale wins.
  await expect(scope.getByTestId('provider-german')).toHaveText('vor 3 Stunden');
  await expect(scope.getByTestId('provider-now')).toHaveText('gerade eben');
  await expect(scope.getByTestId('provider-own')).toHaveText('3 hours ago');
  await expect(scope.getByTestId('formatted')).toHaveText('in 3 hr.');
  // The element carries the exact moment; an invalid moment renders nothing.
  const fixed = scope.getByTestId('fixed');
  await expect(fixed).toHaveJSProperty('tagName', 'TIME');
  await expect(fixed).toHaveAttribute('datetime', '2026-10-16T12:00:00.000Z');
  await expect(scope.getByTestId('invalid')).toBeEmpty();
  // An invalid now is left out, and the text follows the clock.
  await expect(scope.getByTestId('invalid-now')).toHaveText('3 hours ago');
});

test('the tooltip shows the date and time on hover, in the theme of the page', async ({ page }) => {
  await page.clock.install();
  await page.goto(fixture);
  const tooltip = page.locator('.env-tooltip');
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`relative-times-${theme}`);
    await scope.getByTestId('fixed').hover();
    await expect(tooltip).toHaveText('Oct 16, 2026, 12:00 PM');
    await expect(page.locator('.env-popup-theme')).toHaveAttribute('data-env-theme', theme);
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.mouse.move(0, 0);
  }
  const scope = page.getByTestId('relative-times-light');
  await scope.getByTestId('fixed-german').hover();
  await expect(tooltip).toHaveText('16.10.2026, 12:00');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
  // A time with a tooltip takes the dotted underline of text with more on hover; one without, none.
  await expect(scope.getByTestId('fixed')).toHaveClass(/\benv-hover-detail\b/);
  await expect(scope.getByTestId('no-tooltip')).not.toHaveClass(/\benv-hover-detail\b/);
  // Without a tooltip nothing opens; the time is never a tab stop.
  await scope.getByTestId('no-tooltip').hover();
  await page.clock.runFor(600);
  await expect(tooltip).toHaveCount(0);
  const focusable = await scope.getByTestId('fixed').evaluate((time) => {
    time.focus();
    return document.activeElement === time;
  });
  expect(focusable).toBe(false);
  // Inside the application's own Tooltip, that tooltip shows instead of the date.
  await page.mouse.move(0, 0);
  await scope.getByTestId('in-tooltip').hover();
  await expect(tooltip).toHaveText('Updated by Alex Morgan light');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
});

test('times sit on the center line of compact controls, wrap in narrow frames and keep their order', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('relative-times-light');
  const button = (await scope.getByRole('button', { name: 'Report settings' }).boundingBox())!;
  const time = (await scope.getByTestId('toolbar-time').boundingBox())!;
  expect(button.height).toBeCloseTo(32, 0);
  expect(time.height).toBeLessThan(button.height);
  expect(Math.abs(time.y + time.height / 2 - (button.y + button.height / 2))).toBeLessThan(2);
  await expect(scope.getByTestId('toolbar-time')).toHaveText('3h ago');

  // A narrow frame wraps the text instead of overflowing.
  const frame = scope.getByTestId('narrow-frame');
  expect(await frame.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const lines = await scope
    .getByTestId('narrow-time')
    .evaluate((element) => element.getClientRects().length);
  expect(lines).toBeGreaterThan(1);

  // English inside right-to-left text keeps its own order.
  const rtl = scope.getByTestId('rtl');
  await expect(rtl).toHaveText('3 hours ago');
  await expect(rtl).toHaveCSS('direction', 'ltr');
  const inOrder = await rtl.evaluate((element) => {
    const text = element.firstChild!;
    const length = text.textContent!.length;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 1);
    const first = range.getBoundingClientRect().left;
    range.setStart(text, length - 1);
    range.setEnd(text, length);
    return first < range.getBoundingClientRect().left;
  });
  expect(inOrder).toBe(true);
});
