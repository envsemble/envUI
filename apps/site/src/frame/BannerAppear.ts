import { useEffect, useLayoutEffect, useState } from 'react';
import type { LineArtMotion } from '@envsemble/envui';
import { useHydrated } from '../shared/useHydrated';
import { useDisplaySettings } from '../display/useDisplaySettings';
import { bannerAppearAttribute, bannerDrawnKey } from '../display/DisplayStorage';

const pathOpenedOn = typeof location === 'undefined' ? '' : location.pathname;

let drawnOrLeftThisLoad = false;

let firstPageDrawsIn: boolean | undefined;

function claimSessionFirstDraw() {
  try {
    if (sessionStorage.getItem(bannerDrawnKey) !== null) return false;
    sessionStorage.setItem(bannerDrawnKey, '');
    return true;
  } catch {
    return true;
  }
}

function drawsInNow(): boolean {
  if (
    drawnOrLeftThisLoad ||
    typeof location === 'undefined' ||
    location.pathname !== pathOpenedOn
  ) {
    return false;
  }
  firstPageDrawsIn ??= claimSessionFirstDraw();
  return firstPageDrawsIn;
}

export function useBannerAppear(page: string): LineArtMotion | undefined {
  const { motionPaused } = useDisplaySettings();
  const hydrated = useHydrated();
  const [shown, setShown] = useState<{ page: string; appear: boolean } | undefined>(() =>
    hydrated ? { page, appear: !motionPaused && drawsInNow() } : undefined,
  );
  if (hydrated && !shown) setShown({ page, appear: !motionPaused && drawsInNow() });
  else if (shown && shown.page !== page) setShown({ page, appear: false });
  const appear = shown?.page === page && shown.appear;
  const decided = shown !== undefined;
  useLayoutEffect(() => {
    if (decided) document.documentElement.removeAttribute(bannerAppearAttribute);
  }, [decided]);
  useEffect(() => {
    if (decided) drawnOrLeftThisLoad = true;
  }, [decided]);
  return appear && !motionPaused ? 'appear' : undefined;
}
