import { useSyncExternalStore } from 'react';

export function useSitePopupOpen() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

const popups = '[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]';

export function sitePopupOpen() {
  const app = document.getElementById('root');
  return [...document.querySelectorAll(popups)].some((popup) => !app?.contains(popup));
}

const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;
let frame = 0;
let open = false;

const snapshot = () => (observer ? open : sitePopupOpen());

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!observer) {
    open = sitePopupOpen();
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
