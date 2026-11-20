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
  className?: string;
}

const delayThatKeepsQuickLoadsFromFlashingMs = 200;

type Phase = 'idle' | 'waiting' | 'running' | 'finishing';
type LoadingBarEvent = 'start' | 'show' | 'stop' | 'hide';

function reduce(
  state: { phase: Phase; run: number },
  event: LoadingBarEvent,
): { phase: Phase; run: number } {
  switch (event) {
    case 'start': {
      if (state.phase === 'running' || state.phase === 'waiting') return state;
      const resumedWhileFinishingRestartsWithoutDelay = state.phase === 'finishing';
      return resumedWhileFinishingRestartsWithoutDelay
        ? { phase: 'running', run: state.run + 1 }
        : { ...state, phase: 'waiting' };
    }
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
 * TopBar's progress, such as loading the next route: a thin bar along its edge that creeps forward
 * while work continues, then completes and fades out.
 */
export function LoadingBar({ active, label, className }: LoadingBarProps) {
  const messages = useMessages('common', common);
  const [state, dispatch] = useReducer(reduce, { phase: 'idle', run: 0 });
  const indicator = useRef<HTMLDivElement>(null);

  useEffect(() => dispatch(active ? 'start' : 'stop'), [active]);

  useEffect(() => {
    if (state.phase !== 'waiting') return;
    const timer = setTimeout(() => dispatch('show'), delayThatKeepsQuickLoadsFromFlashingMs);
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(
    function removeOnceFadedOut() {
      const element = indicator.current;
      if (state.phase !== 'finishing' || !element) return;
      const time = motionTime(element, 'transition');
      const motionTokensAreZero = time === 0;
      if (motionTokensAreZero) {
        dispatch('hide');
        return;
      }
      const end = (event: TransitionEvent) => {
        if (event.target === element && event.propertyName === 'opacity') dispatch('hide');
      };
      element.addEventListener('transitionend', end);
      const inCaseNoTransitionEndComes = setTimeout(() => dispatch('hide'), time + 100);
      return () => {
        element.removeEventListener('transitionend', end);
        clearTimeout(inCaseNoTransitionEndComes);
      };
    },
    [state.phase, state.run],
  );

  if (state.phase === 'idle' || state.phase === 'waiting') return null;
  return (
    <div
      key={state.run}
      role="progressbar"
      aria-label={label ?? messages.loading}
      className={classNames('env-loading-bar', className)}
      data-state={state.phase}
    >
      <div ref={indicator} className="env-loading-bar-indicator" />
    </div>
  );
}
