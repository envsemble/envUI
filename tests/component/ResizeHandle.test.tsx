import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ResizeHandle, Theme } from '@envsemble/envui';
import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Primitives.fixture.tsx';
import { box, css, keyboard, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

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
  const rtl = page.getByTestId('resize-rtl').getByRole('separator');
  (rtl.element() as HTMLElement).focus();
  await keyboard.press('ArrowLeft');
  await expect.element(rtl).toHaveAttribute('aria-valuenow', '210');
});

test('follows the pointer and commits as the drag ends', { tags: ['engines'] }, async () => {
  const handle = page.getByTestId('resize-ltr').getByRole('separator');
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

test(
  'the track is invisible with a grip of three dots, and a line shows under the pointer, while dragged and with focus',
  { tags: ['engines'] },
  async () => {
    const handle = page.getByTestId('resize-ltr').getByRole('separator');
    const element = handle.element() as HTMLElement;
    element.scrollIntoView({ block: 'center' });
    const line = () => css(element, 'background-color', '::before');
    const colorOf = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      element.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    expect(line()).toBe('rgba(0, 0, 0, 0)');
    expect(css(element, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(element, 'content', '::after')).not.toBe('none');
    const { x, y, width, height } = box(handle);
    await mouse.move(x + width / 2, y + height / 2);
    await expect.poll(line).toBe(colorOf('--env-color-border-muted'));
    expect(css(element, 'width', '::before')).toBe('1px');
    await mouse.down();
    await mouse.move(x + width / 2 + 20, y + height / 2, { steps: 3 });
    await mouse.move(0, 0, { steps: 3 });
    await expect.poll(line).toBe(colorOf('--env-color-border-muted'));
    await mouse.up();
    await expect.poll(line).toBe('rgba(0, 0, 0, 0)');
    element.blur();
    await keyboard.press('Escape');
    element.focus();
    await expect.poll(line).toBe(colorOf('--env-color-border-focus'));
    expect(css(element, 'width', '::before')).toBe('2px');
  },
);

test("the caller's handlers run first, and one that prevents the default keeps the handle's own from running", async () => {
  const keys: string[] = [];
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  function Handle() {
    const [value, setValue] = useState(20);
    return (
      <Theme theme="light">
        <ResizeHandle
          axis="inline"
          label="Resize the notes"
          value={value}
          min={10}
          max={30}
          step={1}
          onChange={setValue}
          onKeyDown={(event) => {
            keys.push(event.key);
            if (event.key === 'ArrowLeft') event.preventDefault();
          }}
        />
      </Theme>
    );
  }
  root.render(<Handle />);
  const handle = page.getByRole('separator', { name: 'Resize the notes' });
  await expect.element(handle).toHaveAttribute('aria-valuenow', '20');
  (handle.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await keyboard.press('ArrowRight');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '21');
  await keyboard.press('ArrowLeft');
  expect(keys).toEqual(['Enter', 'ArrowRight', 'ArrowLeft']);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '21');
  root.unmount();
  host.remove();
});
