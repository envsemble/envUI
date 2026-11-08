import { useSyncExternalStore } from 'react';

/**
 * Whether one of the site's own popups is open, such as the Display menu, search or the navigation
 * sheet: a menu, list or dialog portalled to the page's body, outside the app (#root), where every
 * stage keeps its own overlays in its layer. While one is, the stages'
 * pointers stand still and their overlays wait to open again, as their presses and openings would
 * otherwise count as a press outside it, and close it.
 */
export function useSitePopupOpen() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

const popups = '[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]';

/** Whether a site popup is open now. */
export function sitePopupOpen() {
  const app = document.getElementById('root');
  return [...document.querySelectorAll(popups)].some((popup) => !app?.contains(popup));
}

const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;
let frame = 0;
let open = false;

/** The last state read while watched, else read now. */
const snapshot = () => (observer ? open : sitePopupOpen());

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) {
    open = sitePopupOpen();
    // Read once a frame at most: the stages change the page many times a second.
    observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const now = sitePopupOpen();
        if (now === open) return;
        open = now;
        for (const each of listeners) each();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    observer?.disconnect();
    observer = null;
    cancelAnimationFrame(frame);
    frame = 0;
  };
}
