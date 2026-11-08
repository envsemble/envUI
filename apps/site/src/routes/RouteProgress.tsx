import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { prefersReducedMotion } from '@envui-internal/internal/reducedMotion';
import { rootMotionDuration } from '../shared/RootMotionTokens';
import { usePendingRoute } from './RouterLink';

/**
 * How long, in ms, a pressed link's page may take before the bar shows: a page that loads quickly
 * never flashes it, as the navigation shows the destination at once meanwhile.
 */
const showDelay = 150;

type Phase = 'idle' | 'waiting' | 'running' | 'finishing';

interface State {
  phase: Phase;
  /** Each run of the bar, which starts afresh, also as it resumes while it finishes. */
  run: number;
}

function reduce(state: State, event: 'start' | 'show' | 'stop' | 'hide'): State {
  const { phase, run } = state;
  switch (event) {
    case 'start':
      if (phase === 'finishing') return { phase: 'running', run: run + 1 };
      return phase === 'idle' ? { phase: 'waiting', run } : state;
    case 'show':
      return phase === 'waiting' ? { phase: 'running', run: run + 1 } : state;
    case 'stop':
      if (phase === 'running') return { phase: 'finishing', run };
      return phase === 'waiting' ? { phase: 'idle', run } : state;
    case 'hide':
      return phase === 'finishing' ? { phase: 'idle', run } : state;
  }
}

/**
 * A quiet sign that the page a link leads to is loading, once it has taken a moment: a thin bar
 * along the top of the page, beside the navigation, that creeps forward while the page loads, then
 * completes and fades out as it shows, as envUI's LoadingBar on a TopBar does (the site has no top
 * bar, so it draws its own, Loading.css). With motion reduced, it appears at its full width and
 * leaves at once.
 */
export function RouteProgress() {
  const pending = usePendingRoute() !== undefined;
  const [{ phase, run }, dispatch] = useReducer(reduce, { phase: 'idle', run: 0 });
  const indicator = useRef<HTMLDivElement>(null);
  useEffect(() => dispatch(pending ? 'start' : 'stop'), [pending]);
  useEffect(() => {
    if (phase !== 'waiting') return;
    const timer = window.setTimeout(() => dispatch('show'), showDelay);
    return () => window.clearTimeout(timer);
  }, [phase]);
  // Finishing, it completes and fades out, and leaves once its fade has ended; a timer at the
  // transitions' length stands in for an end that never comes, such as in a hidden tab.
  useEffect(() => {
    const element = indicator.current;
    if (phase !== 'finishing' || !element) return;
    if (prefersReducedMotion()) return dispatch('hide');
    const end = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'opacity') dispatch('hide');
    };
    element.addEventListener('transitionend', end);
    const timer = window.setTimeout(
      () => dispatch('hide'),
      rootMotionDuration('slow') + rootMotionDuration('fast') + 100,
    );
    return () => {
      element.removeEventListener('transitionend', end);
      window.clearTimeout(timer);
    };
  }, [phase, run]);
  // Over the page's own column, the scrolling body, as the window's top over the navigation would
  // start where the reader isn't looking.
  const bar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = bar.current;
    const body = element?.closest<HTMLElement>('.env-scaffold-body');
    if (!element || !body) return;
    element.style.left = `${body.getBoundingClientRect().left + body.clientLeft}px`;
    element.style.width = `${body.clientWidth}px`;
  }, [run]);
  if (phase === 'idle' || phase === 'waiting') return null;
  return (
    <div
      key={run}
      ref={bar}
      role="progressbar"
      aria-label="Loading page"
      className="site-route-progress"
      data-state={phase}
    >
      <div ref={indicator} className="site-route-progress-indicator" />
    </div>
  );
}
