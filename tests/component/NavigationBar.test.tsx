import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Navigation.fixture.tsx';
import { box, keyboard, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('navigation-light');
const texts = (elements: Element[]) => elements.map((element) => element.textContent);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);

test('Bar shows five destinations at most, and opens the rest from More', async () => {
  const four = scope().getByRole('navigation', { name: 'Mail bar' });
  const widths = four
    .getByRole('listitem')
    .elements()
    .map((item) => box(item).width);
  expect(widths).toHaveLength(4);
  // The destinations share the bar's width.
  for (const width of widths) expect(Math.abs(width - widths[0]!)).toBeLessThan(1);
  // Five destinations fit without More.
  const five = scope().getByRole('navigation', { name: 'Five bar' });
  expect(five.getByRole('listitem').elements()).toHaveLength(5);
  expect(five.element().querySelector('.env-navigation-bar-more')).toBeNull();

  const bar = scope().getByRole('navigation', { name: 'Many bar' });
  expect(bar.getByRole('listitem').elements()).toHaveLength(5);
  expect(texts([...bar.element().querySelectorAll('.env-navigation-bar-label')])).toEqual([
    'Home',
    'Inbox',
    'Drafts',
    'Sent',
    'More',
  ]);
  // More holds the current destination and counts what it holds: Labels, 4, and Archive, 1.
  const more = bar.getByRole('button', { name: 'More, 5 new, current page inside', exact: true });
  await expect.element(more).toHaveAttribute('data-current', '');
  await expect.element(more).not.toHaveAttribute('aria-current');
  // Its text is its label, then its count, as its name reads them, with its icon drawn above.
  expect(more.element().textContent).toBe('More 5');
  const icon = box(more.element().querySelector('.env-navigation-bar-indicator')!);
  const label = box(more.element().querySelector('.env-navigation-bar-label')!);
  expect(icon.y + icon.height).toBeLessThanOrEqual(label.y + 0.5);
  await more.click();
  const menu = page.getByRole('menu', { name: 'More' });
  await expect.poll(() => menu.getByRole('menuitem').elements()).toHaveLength(3);
  const labels = menu.getByRole('menuitem', { name: /Labels/ });
  await expect.element(labels).toHaveAttribute('aria-current', 'page');
  await expect.element(labels).toHaveAccessibleName('Labels, 4 new');
  await expect
    .element(menu.getByRole('menuitem', { name: /Archive/ }))
    .toHaveAttribute('href', '#archive');
  (menu.getByRole('menuitem', { name: /Trash/ }).element() as HTMLElement).focus();
  await keyboard.press('Escape');
  await isHidden(menu);
  await expect.element(more).toHaveFocus();
});

test(
  'More opens from the keyboard, and the arrow keys move through its destinations',
  { tags: ['engines'] },
  async () => {
    const bar = scope().getByRole('navigation', { name: 'Many bar' });
    // Tab reaches More after the four destinations before it.
    (bar.getByRole('link', { name: 'Sent', exact: true }).element() as HTMLElement).focus();
    await keyboard.press('Tab');
    const more = page.elementLocator(bar.element().querySelector('.env-navigation-bar-more')!);
    await expect.element(more).toHaveFocus();
    await expect.element(more).toHaveAttribute('aria-haspopup', 'menu');
    await keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'More' });
    await expect.poll(() => shown(menu)).toBe(true);
    await expect.element(more).toHaveAttribute('aria-expanded', 'true');
    const items = () => menu.getByRole('menuitem').elements();
    await expect.poll(() => document.activeElement).toBe(items()[0]);
    await keyboard.press('ArrowDown');
    await expect.poll(() => document.activeElement).toBe(items()[1]);
    await keyboard.press('End');
    await expect.poll(() => document.activeElement).toBe(items().at(-1));
    // Enter selects a destination without href, and the menu closes.
    await keyboard.press('Home');
    await expect.element(page.elementLocator(items()[0]!)).toHaveAccessibleName('Labels, 4 new');
    await keyboard.press('Enter');
    await isHidden(menu);
    await expect
      .poll(() => scope().getByTestId('current').element().textContent)
      .toBe('Inbox, Labels');
  },
);
