import { afterEach, beforeEach } from 'vitest';
import { commands, page } from 'vitest/browser';
import { unmount } from './Mount.tsx';
import { stopCollectingErrors } from './Browser.ts';

const viewport = { width: innerWidth, height: innerHeight };
const search = location.search;

beforeEach(async () => {
  // Each test starts with the pointer away from the page's content, as a fresh page has it.
  await commands.mouseMove(0, 0);
});

// Each test leaves the page as it found it: its fixture, styles, query, size, media and scroll.
afterEach(async () => {
  await commands.mouseUp();
  unmount();
  stopCollectingErrors();
  for (const name of Object.keys(document.body.dataset)) delete document.body.dataset[name];
  localStorage.clear();
  sessionStorage.clear();
  for (const style of document.querySelectorAll('style[data-test-style]')) style.remove();
  history.replaceState(null, '', `${location.pathname}${search}`);
  // Focus moved by the keyboard, with the fixture gone, puts back a fresh page's input modality,
  // in which focus moved by script shows as keyboard focus (:focus-visible), whatever the test
  // pressed last: a stand-in button first in the page takes Tab, then leaves.
  const standIn = document.createElement('button');
  document.body.prepend(standIn);
  (document.activeElement as HTMLElement | null)?.blur?.();
  window.focus();
  await commands.keyPress('Tab');
  standIn.remove();
  getSelection()?.removeAllRanges();
  window.scrollTo(0, 0);
  if (innerWidth !== viewport.width || innerHeight !== viewport.height)
    await page.viewport(viewport.width, viewport.height);
  await commands.emulateMedia({ reducedMotion: null, contrast: null, colorScheme: null });
});
