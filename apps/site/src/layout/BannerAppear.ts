import { useEffect, useState } from 'react';
import type { LineArtMotion } from '@envsemble/envui';
import { useDisplaySettings } from '../theme/DisplaySettings';

/** Where the site keeps when each page's banner last drew itself in, by page. */
const storageKey = 'envui-catalogue-banners-drawn';

/** How long a page's banner stays whole after it has drawn itself in, before it draws again. */
const grace = 30 * 60 * 1000;

/** When each page's banner last drew itself in, in ms since the epoch. */
function drawnAt(): Record<string, number> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    return stored && typeof stored === 'object' ? (stored as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** Whether a page's banner hasn't drawn itself in for a while, or ever. */
function due(page: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return Date.now() - (drawnAt()[page] ?? 0) >= grace;
}

/** Records that a page's banner has drawn itself in now, forgetting pages past their grace. */
function record(page: string) {
  const now = Date.now();
  const fresh = Object.entries(drawnAt()).filter(([, at]) => now - at < grace);
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...Object.fromEntries(fresh), [page]: now }));
  } catch {
    // Storage full or blocked: the banner draws in on every visit.
  }
}

/**
 * A catalogue banner's drawing draws itself in, LineArt's appear motion, the first time its page
 * opens in half an hour, and is whole otherwise, so moving between pages shows each drawing appear
 * once rather than on every visit. Where the reader has paused the site's animations it is whole
 * from the start, and pausing them while it draws shows it whole at once; where reduced motion is
 * preferred, LineArt shows it whole at once too.
 */
export function useBannerAppear(page: string): LineArtMotion | undefined {
  const { motionPaused } = useDisplaySettings();
  // Decided once for each page the banner shows, as the banner stays while the reader moves on.
  const [shown, setShown] = useState(() => ({ page, appear: !motionPaused && due(page) }));
  if (shown.page !== page) setShown({ page, appear: !motionPaused && due(page) });
  const appear = shown.page === page && shown.appear;
  useEffect(() => {
    if (appear) record(page);
  }, [appear, page]);
  return appear && !motionPaused ? 'appear' : undefined;
}
