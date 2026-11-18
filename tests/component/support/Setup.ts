import { afterEach, beforeEach } from 'vitest';
import { commands, page } from 'vitest/browser';
import { unmount } from './Mount.tsx';
import { stopCollectingErrors } from './Browser.ts';

const viewport = { width: innerWidth, height: innerHeight };
const search = location.search;

beforeEach(async () => {
  await commands.mouseMove(0, 0);
});

async function restoreFreshPageKeyboardModality() {
  const standIn = document.createElement('button');
  document.body.prepend(standIn);
  (document.activeElement as HTMLElement | null)?.blur?.();
  window.focus();
  await commands.keyPress('Tab');
  standIn.remove();
}

afterEach(async () => {
  await commands.mouseUp();
  unmount();
  stopCollectingErrors();
  for (const name of Object.keys(document.body.dataset)) delete document.body.dataset[name];
  localStorage.clear();
  sessionStorage.clear();
  for (const style of document.querySelectorAll('style[data-test-style]')) style.remove();
  history.replaceState(null, '', `${location.pathname}${search}`);
  await restoreFreshPageKeyboardModality();
  getSelection()?.removeAllRanges();
  window.scrollTo(0, 0);
  if (innerWidth !== viewport.width || innerHeight !== viewport.height)
    await page.viewport(viewport.width, viewport.height);
  await commands.emulateMedia({
    reducedMotion: null,
    contrast: null,
    colorScheme: null,
    forcedColors: null,
  });
});
