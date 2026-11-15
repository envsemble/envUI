import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/List.fixture.tsx';
import { keyboard, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test('a list whose reorder code fails to load leaves its handles alone, and a remount tries again', async () => {
  await commands.failModule('reorderController');
  try {
    const list = mount(fixture);
    const handle = () =>
      page
        .getByTestId('slides')
        .getByRole('button', { name: 'Reorder Intro' })
        .element() as HTMLElement;
    const order = () => page.getByTestId('slides-order').element().textContent;
    await commands.moduleRequested('reorderController');
    await nextFrames();
    await expect
      .poll(() => {
        const key = { key: ' ', code: 'Space', bubbles: true, cancelable: true };
        const down = new KeyboardEvent('keydown', key);
        handle().dispatchEvent(down);
        handle().dispatchEvent(new KeyboardEvent('keyup', key));
        return down.defaultPrevented;
      })
      .toBe(false);
    let prevented: boolean | undefined;
    const listening = new AbortController();
    window.addEventListener('keydown', (event) => (prevented = event.defaultPrevented), {
      signal: listening.signal,
    });
    handle().focus();
    await keyboard.press('Space');
    listening.abort();
    expect(prevented).toBe(false);
    await keyboard.press('ArrowDown');
    expect(handle().getAttribute('aria-pressed')).toBe('false');
    expect(order()).toBe('Intro,Roadmap,Budget,Questions');

    await commands.releaseModule('reorderController');
    list.remount();
    handle().focus();
    await keyboard.press('Space');
    await keyboard.press('ArrowDown');
    await keyboard.press('Space');
    await expect.poll(order).toBe('Roadmap,Intro,Budget,Questions');
  } finally {
    await commands.unrouteModule('reorderController');
  }
});
