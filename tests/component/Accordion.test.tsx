import { beforeEach, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Accordion.fixture.tsx';
import { css, keyboard, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  mount(fixture);
});

/** Which of the indicator's two icons shows: plus while closed, minus while open. */
function indicator(trigger: Locator) {
  const element = trigger.element();
  const [plus, minus] = element.querySelectorAll('.env-accordion-indicator > svg');
  // The two share a cell and fade into each other; the one not shown is hidden.
  const iconShown = (icon: Element) => getComputedStyle(icon).visibility !== 'hidden';
  return {
    plus: iconShown(plus!),
    minus: iconShown(minus!),
    transform: css(element.querySelector('.env-accordion-indicator')!, 'transform'),
  };
}

const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);

test('one item opens at a time, with a plus that becomes a minus', async () => {
  const single = page.getByTestId('single');
  const first = single.getByRole('button', { name: 'First question' });
  const second = single.getByRole('button', { name: 'Second question' });
  // Each title is a button inside a heading, at the default level.
  await isShown(single.getByRole('heading', { level: 3, name: 'First question' }));
  await expect.element(second).toHaveAttribute('aria-expanded', 'true');
  await expect.element(first).toHaveAttribute('aria-expanded', 'false');
  await isShown(single.getByText('Second answer'));
  expect(indicator(first)).toEqual({ plus: true, minus: false, transform: 'none' });
  expect(indicator(second)).toEqual({ plus: false, minus: true, transform: 'none' });
  await first.click();
  await expect.element(first).toHaveAttribute('aria-expanded', 'true');
  await expect.element(second).toHaveAttribute('aria-expanded', 'false');
  await isShown(single.getByText('First answer'));
  await isHidden(single.getByText('Second answer'));
  await expect
    .poll(() => indicator(first))
    .toEqual({ plus: false, minus: true, transform: 'none' });
  // A disabled item doesn't open.
  const disabled = single.getByRole('button', { name: 'Unavailable question' });
  await disabled.click({ force: true });
  await expect.element(disabled).toHaveAttribute('aria-expanded', 'false');
});

test('multiple keeps several items open, at the heading level given', async () => {
  const multiple = page.getByTestId('multiple');
  await multiple.getByRole('button', { name: 'Notifications' }).click();
  await multiple.getByRole('button', { name: 'Privacy' }).click();
  await isShown(multiple.getByText('Notification settings'));
  await isShown(multiple.getByText('Privacy settings'));
  await isShown(multiple.getByRole('heading', { level: 2, name: 'Privacy' }));
});

test('a controlled accordion shows what value says and reports changes', async () => {
  const controlled = page.getByTestId('controlled');
  await page.getByRole('button', { name: 'Open billing' }).click();
  await expect
    .element(controlled.getByRole('button', { name: 'Billing' }))
    .toHaveAttribute('aria-expanded', 'true');
  await controlled.getByRole('button', { name: 'Account' }).click();
  await isShown(controlled.getByText('Account help'));
  await expect
    .poll(() => page.getByTestId('accordion-changes').element().textContent)
    .toBe('account');
});

test(
  'the keyboard moves between the headings and opens and closes them',
  { tags: ['engines'] },
  async () => {
    const multiple = page.getByTestId('multiple');
    const notifications = multiple.getByRole('button', { name: 'Notifications' });
    const privacy = multiple.getByRole('button', { name: 'Privacy' });
    (notifications.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(notifications).toHaveAttribute('aria-expanded', 'true');
    await keyboard.press('Space');
    await expect.element(notifications).toHaveAttribute('aria-expanded', 'false');
    await keyboard.press('Tab');
    await expect.element(privacy).toHaveFocus();
    // The arrow keys, Home and End don't move between headings: Tab does.
    for (const key of ['ArrowUp', 'Home', 'End']) {
      await keyboard.press(key);
      await expect.element(privacy).toHaveFocus();
    }
    await expect.poll(() => css(privacy, 'outline-style')).toBe('solid');
    await keyboard.press('Space');
    await expect.element(privacy).toHaveAttribute('aria-expanded', 'true');
  },
);
