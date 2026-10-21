'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useMessages } from '../internal/EnvUIContext.js';
import { common } from './messages/common.js';

const SkeletonContext = createContext(false);

/**
 * Whether the component is inside a skeleton: a surface with `skeleton` around it. A component of
 * the application's own reads it to give its skeleton a look of its own, such as a chart's.
 */
export function useSkeleton(): boolean {
  return useContext(SkeletonContext);
}

/**
 * Puts every skeleton's pulse in step: each root runs its own animation, started when it
 * rendered, so their start times are moved to the document timeline's start.
 */
export function alignPulses() {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') return;
  for (const animation of document.getAnimations()) {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    if (
      'animationName' in animation &&
      target?.hasAttribute('data-env-skeleton') &&
      animation.startTime !== 0
    )
      animation.startTime = 0;
  }
}

/**
 * Tells the components inside a skeleton that they are in one, and keeps its pulse in step with
 * the others on the page. Every component that takes `skeleton` renders it around its content.
 */
export function SkeletonScope({ skeleton, children }: { skeleton: boolean; children?: ReactNode }) {
  const inherited = useContext(SkeletonContext);
  const active = skeleton || inherited;
  useEffect(() => {
    if (skeleton) alignPulses();
  }, [skeleton]);
  return <SkeletonContext value={active}>{children}</SkeletonContext>;
}

/**
 * The busy region of a skeleton whose root can't hold a wrapper, such as a list: a visually hidden
 * status beside it that says it is loading, which assistive technology hears in place of the
 * inert root.
 */
export function SkeletonStatus() {
  const messages = useMessages('common', common);
  return (
    <span className="env-skeleton-status" role="status" aria-busy="true">
      {messages.loading}
    </span>
  );
}
