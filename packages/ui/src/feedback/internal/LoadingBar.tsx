'use client';

import { useEffect, useReducer } from 'react';
import { classNames } from '../../internal/classNames.js';

export interface LoadingBarProps {
  /** Shows progress while true; the bar then completes and fades out. */
  active: boolean;
  /** Accessible name while the bar is visible. */
  label?: string;
  /** Milliseconds to wait before appearing, so quick loads never flash the bar. Defaults to 200. */
  delay?: number;
  /** Pin the bar to the top of its positioned container instead of the viewport. */
  contained?: boolean;
  className?: string;
}

type Phase = 'idle' | 'waiting' | 'running' | 'finishing';
type LoadingBarEvent = 'start' | 'show' | 'stop' | 'hide';

/** How long the bar takes to complete and fade out; matches the finishing transitions in CSS. */
const finishDuration = 400;

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
  label = 'Loading',
  delay = 200,
  contained = false,
  className,
}: LoadingBarProps) {
  const [state, dispatch] = useReducer(reduce, { phase: 'idle', run: 0 });

  useEffect(() => dispatch(active ? 'start' : 'stop'), [active]);

  useEffect(() => {
    if (state.phase !== 'waiting' && state.phase !== 'finishing') return;
    const timer = setTimeout(
      () => dispatch(state.phase === 'waiting' ? 'show' : 'hide'),
      state.phase === 'waiting' ? delay : finishDuration,
    );
    return () => clearTimeout(timer);
  }, [state.phase, delay]);

  if (state.phase === 'idle' || state.phase === 'waiting') return null;
  return (
    <div
      key={state.run}
      role="progressbar"
      aria-label={label}
      className={classNames('env-loading-bar', contained && 'env-loading-bar-contained', className)}
      data-state={state.phase}
    >
      <div className="env-loading-bar-indicator" />
    </div>
  );
}
