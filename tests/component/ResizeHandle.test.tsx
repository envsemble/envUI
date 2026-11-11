import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Primitives.fixture.tsx';
import { box, keyboard, mouse } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const committed = (dir: string) => () => page.getByTestId(`committed-${dir}`).element().textContent;

test('moves with the arrow keys, Home and End, in the reading direction', async () => {
  const ltr = page.getByTestId('resize-ltr').getByRole('separator', { name: 'Resize pane' });
  await expect.element(ltr).toHaveAttribute('aria-orientation', 'vertical');
  await expect.element(ltr).toHaveAttribute('aria-valuenow', '200');
  (ltr.element() as HTMLElement).focus();
  await keyboard.press('ArrowRight');
  await expect.element(ltr).toHaveAttribute('aria-valuenow', '210');
  await keyboard.press('Shift+ArrowLeft');
  await expect.element(ltr).toHaveAttribute('aria-valuenow', '110');
  await keyboard.press('End');
  await expect.element(ltr).toHaveAttribute('aria-valuenow', '400');
  await keyboard.press('Home');
  await expect.element(ltr).toHaveAttribute('aria-valuenow', '100');
  await expect.poll(committed('ltr')).toBe('100');
  // In RTL the pane grows toward the left.
  const rtl = page.getByTestId('resize-rtl').getByRole('separator');
  (rtl.element() as HTMLElement).focus();
  await keyboard.press('ArrowLeft');
  await expect.element(rtl).toHaveAttribute('aria-valuenow', '210');
});

test('follows the pointer and commits as the drag ends', { tags: ['engines'] }, async () => {
  const handle = page.getByTestId('resize-ltr').getByRole('separator');
  // The mouse moves in the viewport, so the handle must be in it.
  handle.element().scrollIntoView({ block: 'center' });
  const { x, y, width, height } = box(handle);
  await mouse.move(x + width / 2, y + height / 2);
  await mouse.down();
  await mouse.move(x + width / 2 + 50, y + height / 2, { steps: 5 });
  await expect.element(handle).toHaveAttribute('data-resizing', '');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '250');
  expect(committed('ltr')()).toBe('200');
  await mouse.up();
  await expect.poll(committed('ltr')).toBe('250');
  await expect.element(handle).not.toHaveAttribute('data-resizing');
});
