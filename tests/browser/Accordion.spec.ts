import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const fixture = `${fixtureUrl}/?fixture=accordions`;

/** Which of the indicator's two icons shows: plus while closed, minus while open. */
const indicator = (trigger: Locator) =>
  trigger.evaluate((element) => {
    const [plus, minus] = element.querySelectorAll('.env-accordion-indicator > svg');
    const shown = (icon: Element) => getComputedStyle(icon).display !== 'none';
    return {
      plus: shown(plus),
      minus: shown(minus),
      transform: getComputedStyle(element.querySelector('.env-accordion-indicator')!).transform,
    };
  });

test('one item opens at a time, with a plus that becomes a minus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const single = page.getByTestId('single');
  const first = single.getByRole('button', { name: 'First question' });
  const second = single.getByRole('button', { name: 'Second question' });
  // Each title is a button inside a heading, at the default level.
  await expect(single.getByRole('heading', { level: 3, name: 'First question' })).toBeVisible();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(single.getByText('Second answer')).toBeVisible();
  expect(await indicator(first)).toEqual({ plus: true, minus: false, transform: 'none' });
  expect(await indicator(second)).toEqual({ plus: false, minus: true, transform: 'none' });
  await first.click();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');
  await expect(single.getByText('First answer')).toBeVisible();
  await expect(single.getByText('Second answer')).toBeHidden();
  expect(await indicator(first)).toEqual({ plus: false, minus: true, transform: 'none' });
  // A disabled item doesn't open.
  const disabled = single.getByRole('button', { name: 'Unavailable question' });
  await disabled.click({ force: true });
  await expect(disabled).toHaveAttribute('aria-expanded', 'false');
});

test('items are separated by full-width hairlines, a line under each and none above the first', async ({
  page,
}) => {
  await page.goto(fixture);
  const single = page.getByTestId('single');
  const lines = await single.evaluate((root) =>
    [...root.querySelectorAll(':scope > .env-accordion-item')].map((item) => {
      const style = getComputedStyle(item);
      return {
        top: style.borderTopWidth,
        bottom: `${style.borderBottomWidth} ${style.borderBottomStyle}`,
        width: item.getBoundingClientRect().width,
      };
    }),
  );
  const width = (await single.boundingBox())!.width;
  expect(lines).toHaveLength(3);
  for (const line of lines) {
    expect(line.top).toBe('0px');
    expect(line.bottom).toBe('1px solid');
    expect(line.width).toBeCloseTo(width, 0);
  }
});

test('the title is medium weight and the muted panel lines up with it, not the indicator', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const single = page.getByTestId('single');
  const label = single.locator('.env-accordion-label', { hasText: 'Second question' });
  const content = single.locator('.env-accordion-content', { hasText: 'Second answer' });
  await expect(label).toHaveCSS('font-weight', '500');
  const muted = await content.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--env-color-fg-muted)';
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(content).toHaveCSS('color', muted);
  const text = await content.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().left;
  });
  expect(text).toBeCloseTo((await label.boundingBox())!.x, 0);
});

test('multiple keeps several items open, at the heading level given', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const multiple = page.getByTestId('multiple');
  await multiple.getByRole('button', { name: 'Notifications' }).click();
  await multiple.getByRole('button', { name: 'Privacy' }).click();
  await expect(multiple.getByText('Notification settings')).toBeVisible();
  await expect(multiple.getByText('Privacy settings')).toBeVisible();
  await expect(multiple.getByRole('heading', { level: 2, name: 'Privacy' })).toBeVisible();
});

test('a controlled accordion shows what value says and reports changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const controlled = page.getByTestId('controlled');
  await page.getByRole('button', { name: 'Open billing' }).click();
  await expect(controlled.getByRole('button', { name: 'Billing' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await controlled.getByRole('button', { name: 'Account' }).click();
  await expect(controlled.getByText('Account help')).toBeVisible();
  await expect(page.getByTestId('accordion-changes')).toHaveText('account');
});

test(
  'the keyboard moves between the headings and opens and closes them',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fixture);
    const multiple = page.getByTestId('multiple');
    const notifications = multiple.getByRole('button', { name: 'Notifications' });
    const privacy = multiple.getByRole('button', { name: 'Privacy' });
    await notifications.focus();
    await page.keyboard.press('Enter');
    await expect(notifications).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(notifications).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Tab');
    await expect(privacy).toBeFocused();
    // The arrow keys, Home and End don't move between headings: Tab does.
    for (const key of ['ArrowUp', 'Home', 'End']) {
      await page.keyboard.press(key);
      await expect(privacy).toBeFocused();
    }
    await expect(privacy).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Space');
    await expect(privacy).toHaveAttribute('aria-expanded', 'true');
  },
);

test('a skeleton is one busy region: titles become bars and indicators shapes', async ({
  page,
}) => {
  await page.goto(fixture);
  const skeleton = page.getByTestId('skeleton');
  await expect(skeleton).toHaveAttribute('data-env-skeleton', '');
  await expect(skeleton).toHaveAttribute('aria-busy', 'true');
  // The lines between items stay; a missing title is a bar.
  await expect(skeleton.locator('.env-accordion-item').first()).toHaveCSS(
    'border-bottom-width',
    '1px',
  );
  const bar = await skeleton
    .locator('.env-accordion-label')
    .first()
    .evaluate((element) => getComputedStyle(element, '::before').display);
  expect(bar).toBe('inline-block');
  // The trigger stays a row, not one filled block.
  await expect(skeleton.locator('.env-accordion-trigger').first()).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
});
