import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as scrollKeys from '../fixture/ScaffoldScrollKeys.fixture.tsx';
import { keyboard, nextFrames, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

// A file of its own: the frame keeps a module once it has loaded it, so the module must not have
// loaded before this test makes it fail.
test(
  'where the scrolling code fails to load the keys stay with the browser, and a remount tries again',
  { tags: ['engines'] },
  async () => {
    await commands.failModule('scrollKeys');
    try {
      await commands.emulateMedia({ reducedMotion: 'reduce' });
      const fixture = mount(scrollKeys);
      await expect.poll(() => shown(page.getByRole('main'))).toBe(true);
      await commands.moduleRequested('scrollKeys');
      // Usually the component has handled the rejection two frames later.
      await nextFrames();
      const taken = new AbortController();
      let cancelled: boolean | undefined;
      window.addEventListener('keydown', (event) => (cancelled = event.defaultPrevented), {
        signal: taken.signal,
      });
      const content = () => document.querySelector('.env-scaffold-body')!;
      window.focus();
      await keyboard.press('PageDown');
      taken.abort();
      expect(cancelled).toBe(false);
      await nextFrames();
      expect(content().scrollTop).toBe(0);
      await commands.releaseModule('scrollKeys');
      fixture.remount();
      await expect.poll(() => shown(page.getByRole('main'))).toBe(true);
      const step = content().clientHeight * 0.875;
      // One page: the key pressed before the remount is gone with the scaffold that heard it.
      await keyboard.press('PageDown');
      await expect.poll(() => Math.abs(content().scrollTop - step)).toBeLessThanOrEqual(1.5);
    } finally {
      await commands.unrouteModule('scrollKeys');
    }
  },
);
