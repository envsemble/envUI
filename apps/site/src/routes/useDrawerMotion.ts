import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '@envui-internal/internal/motion/reducedMotion';
import { rootMotionDuration, rootMotionEasing } from '../shared/RootMotionTokens';
import type { CatalogueSection } from './SiteRoutes';
import { useLatest } from '@envui-internal/internal/useLatest';

/** How the catalogue's drawer is moving, if it is (useDrawerMotion). */
type DrawerMotion = 'arriving' | 'entering' | 'leaving' | 'holding' | 'switching';

/** The drawer the catalogue's navigation draws: its destination's pages, and which is current. */
interface DrawnDrawer {
  section: CatalogueSection;
  routePath: string;
}

/**
 * The catalogue's drawer as the reader goes between a destination without it, such as Overview,
 * and one with it: it comes in beside the rail, its panel fading in and its list sliding a little
 * out of the rail's edge and fading in, and goes again quicker, laid over the page's start while
 * it fades, so the page beside it takes its place at once and never moves (Shell.css). The page
 * the reader opened first shows it at once. Going between two destinations that both have it, its
 * panel stays and its list is replaced: the one there stays until the new page has painted, then
 * the new one fades in and slides the same short way out of the rail's edge; a page of the same
 * destination changes nothing but which page is current. `motion` is `arriving` until the page
 * beside it has painted, then `entering` while it comes in, and `leaving` while it goes, when
 * `drawn` is the drawer that was there; `holding` keeps the list of the destination before until
 * the new page has painted, and `switching` brings the new one in. It ends with its transitions,
 * at once where there are none, such as in a narrower window, where this drawer isn't shown.
 */
export function useDrawerMotion(
  navigation: RefObject<HTMLElement | null>,
  shows: boolean,
  section: CatalogueSection,
  routePath: string,
) {
  const [state, setState] = useState<{ shows: boolean; motion?: DrawerMotion; last: DrawnDrawer }>(
    () => ({ shows, last: { section, routePath } }),
  );
  // Adjusted as the route changes, in the render it changes in, so the drawer comes and goes on
  // the page's first frame.
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
  // The destination the route shows now, for the list that replaces the one held.
  const latest = useLatest<DrawnDrawer>({ section, routePath });
  // Switching, the new list replaces the one held, before it paints: it starts unseen beside the
  // rail's edge and comes in as an entrance does, and only fades under reduced motion.
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
    // Holding, the new destination's list replaces the one there on the frame after the one that
    // paints the new page.
    if (motion === 'holding') {
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() =>
          setState((now) =>
            now.motion === 'holding' ? { ...now, motion: 'switching', last: latest.current } : now,
          ),
        );
      });
      return () => cancelAnimationFrame(frame);
    }
    // Arriving, it starts its entrance on the frame after the one that paints the page.
    if (motion === 'arriving') {
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() =>
          setState((now) => (now.motion === 'arriving' ? { ...now, motion: 'entering' } : now)),
        );
      });
      return () => cancelAnimationFrame(frame);
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
