import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as scrollKeys from '../fixture/ScaffoldScrollKeys.fixture.tsx';
import { keyboard, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test(
  'alone in its file, as the module loads once: where the scrolling code fails to load the keys stay with the browser, and a remount tries again',
  { tags: ['engines', 'once'] },
  async () => {
    await commands.failModule('scrollKeys');
    try {
      await commands.emulateMedia({ reducedMotion: 'reduce' });
      const fixture = mount(scrollKeys);
      await expect.poll(() => shown(page.getByRole('main'))).toBe(true);
      await commands.moduleRequested('scrollKeys');
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
      await keyboard.press('PageDown');
      await expect.poll(() => Math.abs(content().scrollTop - step)).toBeLessThanOrEqual(1.5);
    } finally {
      await commands.unrouteModule('scrollKeys');
    }
  },
);
