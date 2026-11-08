import { useEffect, useState } from 'react';
import type { LineArtMotion } from '@envsemble/envui';
import { useDisplaySettings } from '../display/DisplaySettings';

/** Where the site keeps, for the tab's session, that a banner has drawn itself in. */
const storageKey = 'envui-site-banner-drawn';

/** Where the site once kept when each page's banner last drew itself in, which it no longer reads. */
const formerKey = 'envui-site-banners-drawn';

/** The address the site opened on, before the reader moved to another page. */
const openedOn = typeof location === 'undefined' ? '' : location.pathname;

/** Whether the session's banner has drawn itself in, or its page has gone, in this page load. */
let spent = false;

/** Whether the session's first page draws its banner in, decided once a load. */
let firstDraw: boolean | undefined;

/** Whether the session's first draw is still to come, which it is once: on its first page. */
function sessionFirst() {
  try {
    localStorage.removeItem(formerKey);
    if (sessionStorage.getItem(storageKey) !== null) return false;
    sessionStorage.setItem(storageKey, '');
  } catch {
    // Storage blocked: the banner draws in on the page the site opens on.
  }
  return true;
}

/**
 * Whether the banner shown now draws itself in: only on the page the session opened on, the first
 * time it does; never after a move to another page or on a reload.
 */
function due(): boolean {
  if (spent || typeof location === 'undefined' || location.pathname !== openedOn) return false;
  firstDraw ??= sessionFirst();
  return firstDraw;
}

/**
 * A catalogue banner's drawing draws itself in, LineArt's appear motion, once a session: on the
 * page the site first opens on, and whole otherwise, on the pages the reader moves to and on a
 * reload, so it never replays as the reader moves around. Where the reader has paused the site's
 * animations it is whole from the start, and pausing them while it draws shows it whole at once;
 * where reduced motion is preferred, LineArt shows it whole at once too.
 */
export function useBannerAppear(page: string): LineArtMotion | undefined {
  const { motionPaused } = useDisplaySettings();
  // Decided once for each page the banner shows, as the banner stays while the reader moves on.
  const [shown, setShown] = useState(() => ({ page, appear: !motionPaused && due() }));
  if (shown.page !== page) setShown({ page, appear: false });
  const appear = shown.page === page && shown.appear;
  // Drawn once, it is spent: the pages the reader moves to, and this one again, show it whole.
  useEffect(() => {
    spent = true;
  }, []);
  return appear && !motionPaused ? 'appear' : undefined;
}
