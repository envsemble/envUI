import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/RelativeTime.fixture.tsx';
import { tooltipDelay } from '../../packages/ui/src/internal/popup/TooltipPopup.tsx';
import { box, keyboard, mouse } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const tooltip = () => document.querySelector('.env-tooltip');
const tooltipText = () => tooltip()?.textContent;
/** Moves the mouse onto an element, scrolled into view first, as Playwright's hover() does. */
async function hover(element: Element) {
  element.scrollIntoView({ block: 'nearest' });
  const point = box(element);
  await mouse.move(point.x + point.width / 2, point.y + point.height / 2);
}

test('the tooltip shows the date and time on hover, in the theme of the page', async () => {
  const time = (theme: string, testId: string) =>
    page.getByTestId(`relative-times-${theme}`).getByTestId(testId).element();
  // The frame takes the key presses, Escape among them.
  window.focus();
  for (const theme of ['light', 'dark']) {
    await hover(time(theme, 'fixed'));
    await expect.poll(tooltipText, { message: theme }).toBe('Oct 16, 2026, 12:00 PM');
    expect(document.querySelector('.env-popup-theme')?.getAttribute('data-env-theme')).toBe(theme);
    await keyboard.press('Escape');
    await expect.poll(tooltip).toBeNull();
    await mouse.move(0, 0);
  }
  await hover(time('light', 'fixed-german'));
  await expect.poll(tooltipText).toBe('16.10.2026, 12:00');
  await mouse.move(0, 0);
  await expect.poll(tooltip).toBeNull();
  // A time with a tooltip takes the dotted underline of text with more on hover; one without, none.
  expect(time('light', 'fixed').classList.contains('env-hover-detail')).toBe(true);
  expect(time('light', 'no-tooltip').classList.contains('env-hover-detail')).toBe(false);
  // Without a tooltip nothing opens: the check waits just past the tooltip's delay.
  await hover(time('light', 'no-tooltip'));
  await new Promise((resolve) => setTimeout(resolve, tooltipDelay + 100));
  expect(tooltip()).toBeNull();
  // The time is never a tab stop.
  const fixed = time('light', 'fixed') as HTMLElement;
  fixed.focus();
  expect(document.activeElement).not.toBe(fixed);
  // Inside the application's own Tooltip, that tooltip shows instead of the date.
  await mouse.move(0, 0);
  await hover(time('light', 'in-tooltip'));
  await expect.poll(tooltipText).toBe('Updated by Alex Morgan light');
  await mouse.move(0, 0);
  await expect.poll(tooltip).toBeNull();
});
