import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { prefersReducedMotion } from '../shared/ReducedMotion';
import { rootMotionDuration } from '../shared/RootMotionTokens';
import { usePendingRoute } from './RouterLink';

const showDelayMs = 150;

const missedTransitionEndGraceMs = 100;

type Phase = 'idle' | 'waiting' | 'running' | 'finishing';

interface State {
  phase: Phase;
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

export function RouteProgress() {
  const pending = usePendingRoute() !== undefined;
  const [{ phase, run }, dispatch] = useReducer(reduce, { phase: 'idle', run: 0 });
  const indicator = useRef<HTMLDivElement>(null);
  useEffect(() => dispatch(pending ? 'start' : 'stop'), [pending]);
  useEffect(() => {
    if (phase !== 'waiting') return;
    const timer = window.setTimeout(() => dispatch('show'), showDelayMs);
    return () => window.clearTimeout(timer);
  }, [phase]);
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
      rootMotionDuration('slow') + rootMotionDuration('fast') + missedTransitionEndGraceMs,
    );
    return () => {
      element.removeEventListener('transitionend', end);
      window.clearTimeout(timer);
    };
  }, [phase, run]);
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
