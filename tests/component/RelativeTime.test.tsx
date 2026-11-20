import { beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/RelativeTime.fixture.tsx';
import { tooltipDelay } from '../../packages/ui/src/internal/popup/TooltipPopup.tsx';
import { box, keyboard, mouse, passTime, stopTimers } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const tooltip = () => document.querySelector('.env-tooltip');
const tooltipText = () => tooltip()?.textContent;
async function hover(element: Element) {
  element.scrollIntoView({ block: 'nearest' });
  const point = box(element);
  await mouse.move(point.x + point.width / 2, point.y + point.height / 2);
}

test('the tooltip shows the date and time on hover, in the theme of the page', async () => {
  const time = (theme: string, testId: string) =>
    page.getByTestId(`relative-times-${theme}`).getByTestId(testId).element();
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
  expect(time('light', 'fixed').classList.contains('env-hover-detail')).toBe(true);
  expect(time('light', 'no-tooltip').classList.contains('env-hover-detail')).toBe(false);
  stopTimers();
  await hover(time('light', 'no-tooltip'));
  const justPastTooltipDelay = tooltipDelay + 100;
  await passTime(justPastTooltipDelay);
  expect(tooltip()).toBeNull();
  vi.useRealTimers();
  const fixed = time('light', 'fixed') as HTMLElement;
  fixed.focus();
  expect(document.activeElement).not.toBe(fixed);
  await mouse.move(0, 0);
  await hover(time('light', 'in-tooltip'));
  await expect.poll(tooltipText).toBe('Updated by Alex Morgan light');
  await mouse.move(0, 0);
  await expect.poll(tooltip).toBeNull();
});

test("renderTooltip gives the tooltip the application's content from the moment", async () => {
  const own = page.getByTestId('relative-times-light').getByTestId('own-tooltip').element();
  await hover(own);
  await expect
    .poll(() => document.querySelector('.env-tooltip strong')?.textContent)
    .toBe('09:00 UTC');
  await mouse.move(0, 0);
  await expect.poll(tooltip).toBeNull();
});
