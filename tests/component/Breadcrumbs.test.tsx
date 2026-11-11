import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/DataDisplay.fixture.tsx';
import { box, keyboard, mouse, nextFrames } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

/**
 * How a breadcrumb trail is laid out: its height in lines, which labels are cut short, and what
 * extends past the navigation's box or clips the crumbs.
 */
function trailLayout(navigation: Locator) {
  const nav = navigation.element();
  const list = nav.querySelector('.env-breadcrumbs-list')!;
  const items = [...list.children];
  const frame = nav.getBoundingClientRect();
  return {
    direction: getComputedStyle(nav).direction,
    wraps: !nav.hasAttribute('data-nowrap'),
    lines:
      list.getBoundingClientRect().height /
      Math.max(...items.map((item) => item.getBoundingClientRect().height)),
    truncated: [...nav.querySelectorAll('.env-breadcrumbs-label')].map(
      (label) => label.scrollWidth > label.clientWidth,
    ),
    outside: [...nav.querySelectorAll('*')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < frame.left - 0.5 || rect.right > frame.right + 0.5;
      })
      .map((element) => element.getAttribute('class')),
    clipping: [nav, list, ...items]
      .filter((element) => getComputedStyle(element).overflowX !== 'visible')
      .map((element) => element.getAttribute('class')),
  };
}

const tooltip = () => document.querySelector('.env-tooltip');
const tooltipText = () => tooltip()?.textContent;

test('a focused breadcrumb label that comes to fit keeps focus until it loses it', async () => {
  const bar = page.getByTestId('breadcrumb-bar-light');
  const current = bar.element().querySelector<HTMLElement>('[aria-current="page"]')!;
  await expect.poll(() => current.getAttribute('tabindex')).toBe('0');
  current.focus();
  // The bar widens, as with the window, until the label fits.
  (bar.element() as HTMLElement).style.inlineSize = '60rem';
  const label = current.querySelector('.env-breadcrumbs-label')!;
  await expect.poll(() => label.scrollWidth > label.clientWidth).toBe(false);
  // The browser moves focus off an element that can no longer take it at its next rendering
  // update, so the check waits past two frames.
  await nextFrames();
  expect(document.activeElement).toBe(current);
  expect(current.getAttribute('tabindex')).toBe('0');
  // Once focus moves on, the label leaves the tab order.
  (bar.getByRole('button', { name: 'More actions' }).element() as HTMLElement).focus();
  await expect.poll(() => current.hasAttribute('tabindex')).toBe(false);
});

test('a narrow trail wraps by default; without wrap it stays on one line and cuts the current page short first', async () => {
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`data-${theme}`);
    const wrapping = trailLayout(scope.getByRole('navigation', { name: 'Wrapping trail' }));
    expect(wrapping.wraps).toBe(true);
    expect(wrapping.lines).toBeGreaterThan(1.5);
    expect(wrapping.outside).toEqual([]);
    for (const [name, direction, truncated] of [
      ['One-line trail', 'ltr', [false, false, true]],
      ['Right-to-left trail', 'rtl', [false, false, true]],
      ['Header trail', 'ltr', [false, true]],
    ] as const) {
      const layout = trailLayout(scope.getByRole('navigation', { name }));
      expect(layout.direction, name).toBe(direction);
      expect(layout.lines, name).toBeCloseTo(1, 1);
      // Only the current page is cut short; earlier levels keep their width.
      expect(layout.truncated, name).toEqual(truncated);
      expect(layout.outside, name).toEqual([]);
      // Nothing clips the crumbs, so their focus outlines stay whole.
      expect(layout.clipping, name).toEqual([]);
    }
    // In a compact header bar as wide as a phone, the trail ends before the status and the action.
    const bar = scope.getByTestId(`breadcrumb-bar-${theme}`);
    const trail = box(bar.getByRole('navigation', { name: 'Header trail' }));
    const status = box(bar.element().querySelector('.env-badge')!);
    const action = box(bar.getByRole('button', { name: 'More actions' }));
    expect(trail.x + trail.width).toBeLessThanOrEqual(status.x);
    expect(status.x + status.width).toBeLessThanOrEqual(action.x);
  }
});

test('a breadcrumb cut short shows its full label in a tooltip, on hover and keyboard focus', async () => {
  const scope = page.getByTestId('data-light');
  const long = 'A folder whose name runs well past the room that one level of a trail takes';
  const trail = scope.getByRole('navigation', { name: 'Long level trail' });
  // Keyboard focus, which WebKit gives links only through focus(): a key press first makes the
  // focus that follows keyboard focus (:focus-visible) in every engine.
  const keyboardFocus = async (name: string) => {
    await keyboard.press('Shift');
    const link = trail.getByRole('link', { name });
    (link.element() as HTMLElement).focus();
    await expect.element(link).toHaveFocus();
  };
  // A level that fits shows no tooltip.
  await keyboardFocus('Workspace');
  await nextFrames();
  expect(tooltip()).toBeNull();
  // The link's name is its whole label; the tooltip shows it as keyboard focus reaches it.
  await keyboardFocus(long);
  await expect.poll(tooltipText).toBe(long);
  await keyboard.press('Escape');
  await expect.poll(tooltip).toBeNull();
  // The current page of a one-line trail, cut short first, shows it on hover.
  const oneLine = scope.getByRole('navigation', { name: 'One-line trail' });
  const current = oneLine.element().querySelector<HTMLElement>('[aria-current="page"]')!;
  const point = box(current);
  await mouse.move(point.x + point.width / 2, point.y + point.height / 2);
  await expect.poll(tooltipText).toBe('Quarterly review of the shared design tokens');
  await mouse.move(0, 0);
  await expect.poll(tooltip).toBeNull();
  // Cut short, it is a tab stop after the links, and keyboard focus shows it in full too.
  expect(current.getAttribute('tabindex')).toBe('0');
  (oneLine.getByRole('link').elements().at(-1) as HTMLElement).focus();
  await keyboard.press('Tab');
  await expect.poll(() => document.activeElement).toBe(current);
  await expect.poll(tooltipText).toBe('Quarterly review of the shared design tokens');
  await keyboard.press('Escape');
  // A current page that fits takes no focus.
  expect(trail.element().querySelector('[aria-current="page"]')!.hasAttribute('tabindex')).toBe(
    false,
  );
});
