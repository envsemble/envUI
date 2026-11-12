import { useEffect, useLayoutEffect, useState } from 'react';
import type { LineArtMotion } from '@envsemble/envui';
import { useHydrated } from '../shared/useHydrated';
import { useDisplaySettings } from '../display/DisplaySettings';
import { bannerAppearAttribute, bannerDrawnKey } from '../display/DisplayStorage';

/** The address the site opened on, before the reader moved to another page. */
const openedOn = typeof location === 'undefined' ? '' : location.pathname;

/** Whether the session's banner has drawn itself in, or its page has gone, in this page load. */
let spent = false;

/** Whether the session's first page draws its banner in, decided once a load. */
let firstDraw: boolean | undefined;

/** Whether the session's first draw is still to come, which it is once: on its first page. */
function sessionFirst() {
  try {
    if (sessionStorage.getItem(bannerDrawnKey) !== null) return false;
    sessionStorage.setItem(bannerDrawnKey, '');
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
 * where reduced motion is preferred, LineArt shows it whole at once too. A pre-rendered page
 * renders it whole on the server and as it hydrates, and decides once hydrated, when the reader's
 * settings are known; meanwhile, where the head's script found it will draw in, its lines are
 * hidden (bannerAppearAttribute, Banners.css), so they don't show whole first.
 */
export function useBannerAppear(page: string): LineArtMotion | undefined {
  const { motionPaused } = useDisplaySettings();
  // The library's useHydrated, not the site's useFiguresMounted: the banner decides whether it
  // appears in the render right after hydrating, before the reader's first frames of it.
  const hydrated = useHydrated();
  // Decided once for each page the banner shows, as the banner stays while the reader moves on.
  const [shown, setShown] = useState<{ page: string; appear: boolean } | undefined>(() =>
    hydrated ? { page, appear: !motionPaused && due() } : undefined,
  );
  if (hydrated && !shown) setShown({ page, appear: !motionPaused && due() });
  else if (shown && shown.page !== page) setShown({ page, appear: false });
  const appear = shown?.page === page && shown.appear;
  // Decided, the lines show as the banner draws them, so the root's mark goes before the paint.
  const decided = shown !== undefined;
  useLayoutEffect(() => {
    if (decided) document.documentElement.removeAttribute(bannerAppearAttribute);
  }, [decided]);
  // Drawn once, it is spent: the pages the reader moves to, and this one again, show it whole.
  useEffect(() => {
    if (decided) spent = true;
  }, [decided]);
  return appear && !motionPaused ? 'appear' : undefined;
}
