import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../shared/ReducedMotion';
import { rootMotionDuration, rootMotionEasing } from '../shared/RootMotionTokens';
import type { CatalogueSection } from '../routes/SiteRoutes';
import { useLatest } from '../shared/useLatest';

type DrawerMotion = 'arriving' | 'entering' | 'leaving' | 'holding' | 'switching';

interface DrawnDrawer {
  section: CatalogueSection;
  routePath: string;
}

function onFrameAfterNextPaint(run: () => void) {
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(run);
  });
  return () => cancelAnimationFrame(frame);
}

export function useDrawerMotion(
  navigation: RefObject<HTMLElement | null>,
  shows: boolean,
  section: CatalogueSection,
  routePath: string,
) {
  const [state, setState] = useState<{ shows: boolean; motion?: DrawerMotion; last: DrawnDrawer }>(
    () => ({ shows, last: { section, routePath } }),
  );
  let next = state;
  if (shows !== state.shows)
    next = shows
      ? { shows, motion: 'arriving', last: { section, routePath } }
      : { ...next, shows, motion: 'leaving' };
  else if (shows && state.motion !== 'holding') {
    if (state.last.section !== section) next = { ...next, motion: 'holding' };
    else if (state.last.routePath !== routePath) next = { ...next, last: { section, routePath } };
  }
  if (next !== state) setState(next);
  const { motion } = next;
  const latest = useLatest<DrawnDrawer>({ section, routePath });
  useLayoutEffect(() => {
    if (motion !== 'switching') return;
    const parts = [
      ...(navigation.current?.querySelectorAll<HTMLElement>(
        '.site-sidebar > :is(.env-navigation-drawer-list, .env-navigation-drawer-footer)',
      ) ?? []),
    ];
    const from = prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, translate: '-0.75rem 0' };
    const to = prefersReducedMotion() ? { opacity: 1 } : { opacity: 1, translate: '0 0' };
    const animations = parts.map((part) =>
      part.animate([from, to], {
        duration: rootMotionDuration('medium'),
        easing: rootMotionEasing('ease-enter'),
      }),
    );
    let current = true;
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (current)
        setState((now) => (now.motion === 'switching' ? { ...now, motion: undefined } : now));
    });
    return () => {
      current = false;
      for (const animation of animations) animation.cancel();
    };
  }, [navigation, motion]);
  useEffect(() => {
    if (!motion || motion === 'switching') return;
    if (motion === 'holding') {
      return onFrameAfterNextPaint(() =>
        setState((now) =>
          now.motion === 'holding' ? { ...now, motion: 'switching', last: latest.current } : now,
        ),
      );
    }
    if (motion === 'arriving') {
      return onFrameAfterNextPaint(() =>
        setState((now) => (now.motion === 'arriving' ? { ...now, motion: 'entering' } : now)),
      );
    }
    const drawer = navigation.current?.querySelector('.site-sidebar[data-site-drawer]');
    const transitions = (drawer?.getAnimations({ subtree: true }) ?? []).filter(
      (animation) => animation instanceof CSSTransition,
    );
    let current = true;
    void Promise.allSettled(transitions.map((transition) => transition.finished)).then(() => {
      if (current) setState((now) => (now.motion === motion ? { ...now, motion: undefined } : now));
    });
    return () => {
      current = false;
    };
  }, [navigation, motion, latest]);
  return {
    drawn: next.shows || motion === 'leaving' ? next.last : undefined,
    motion,
  };
}
