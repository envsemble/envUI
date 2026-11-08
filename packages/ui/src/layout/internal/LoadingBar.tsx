'use client';

import { useEffect, useReducer, useRef } from 'react';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { common } from '../../foundations/messages/common.js';
import { motionTime } from '../../internal/motion/motionTokens.js';
import '../../styles/Base.css';
import '../../styles/LoadingBar.css';

export interface LoadingBarProps {
  /** Shows progress while true; the bar then completes and fades out. */
  active: boolean;
  /** Accessible name while the bar is visible; EnvUIProvider's messages.common.loading by default. */
  label?: string;
  /** Milliseconds to wait before appearing, so quick loads never flash the bar. Defaults to 200. */
  delay?: number;
  /** Pin the bar to the top of its positioned container instead of the viewport. */
  contained?: boolean;
  className?: string;
}

type Phase = 'idle' | 'waiting' | 'running' | 'finishing';
type LoadingBarEvent = 'start' | 'show' | 'stop' | 'hide';

function reduce(
  state: { phase: Phase; run: number },
  event: LoadingBarEvent,
): { phase: Phase; run: number } {
  switch (event) {
    case 'start':
      if (state.phase === 'running' || state.phase === 'waiting') return state;
      // Work that resumes while the bar is finishing restarts it at once, without another delay.
      return state.phase === 'finishing'
        ? { phase: 'running', run: state.run + 1 }
        : { ...state, phase: 'waiting' };
    case 'show':
      return state.phase === 'waiting' ? { phase: 'running', run: state.run + 1 } : state;
    case 'stop':
      if (state.phase === 'running') return { ...state, phase: 'finishing' };
      return state.phase === 'waiting' ? { ...state, phase: 'idle' } : state;
    case 'hide':
      return state.phase === 'finishing' ? { ...state, phase: 'idle' } : state;
  }
}

/**
 * Page-level progress, such as loading the next route: a thin bar that creeps forward while work
 * continues, then completes and fades out.
 */
export function LoadingBar({
  active,
  label,
  delay = 200,
  contained = false,
  className,
}: LoadingBarProps) {
  const messages = useMessages('common', common);
  const [state, dispatch] = useReducer(reduce, { phase: 'idle', run: 0 });
  const indicator = useRef<HTMLDivElement>(null);

  useEffect(() => dispatch(active ? 'start' : 'stop'), [active]);

  useEffect(() => {
    if (state.phase !== 'waiting') return;
    const timer = setTimeout(() => dispatch('show'), delay);
    return () => clearTimeout(timer);
  }, [state.phase, delay]);

  // Finishing, the bar completes and fades out, and is removed once its fade has ended: at once
  // where the motion tokens are 0s. A timer at the transitions' length stands in for an end event
  // that never comes, such as in a hidden container, where nothing transitions.
  useEffect(() => {
    const element = indicator.current;
    if (state.phase !== 'finishing' || !element) return;
    const time = motionTime(element, 'transition');
    if (time === 0) {
      dispatch('hide');
      return;
    }
    const end = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'opacity') dispatch('hide');
    };
    element.addEventListener('transitionend', end);
    const timer = setTimeout(() => dispatch('hide'), time + 100);
    return () => {
      element.removeEventListener('transitionend', end);
      clearTimeout(timer);
    };
  }, [state.phase, state.run]);

  if (state.phase === 'idle' || state.phase === 'waiting') return null;
  return (
    <div
      key={state.run}
      role="progressbar"
      aria-label={label ?? messages.loading}
      className={classNames('env-loading-bar', contained && 'env-loading-bar-contained', className)}
      data-state={state.phase}
    >
      <div ref={indicator} className="env-loading-bar-indicator" />
    </div>
  );
}
