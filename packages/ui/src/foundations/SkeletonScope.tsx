'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useMessages } from '../internal/EnvUIContext.js';
import { common } from './messages/common.js';
import '../styles/Base.css';
import '../styles/Skeleton.css';

const SkeletonContext = createContext(false);

/**
 * Whether the component is inside a skeleton: a surface with `skeleton` around it. A component of
 * the application's own reads it to give its skeleton a look of its own, such as a chart's.
 */
export function useSkeleton(): boolean {
  return useContext(SkeletonContext);
}

/**
 * Puts every skeleton's shimmer in step: each root runs its own animation, started when it
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
 * Tells the components inside a skeleton that they are in one, and keeps its shimmer in step with
 * the others on the page. Every component that takes `skeleton` renders it around its content.
 */
export function SkeletonScope({ skeleton, children }: { skeleton: boolean; children?: ReactNode }) {
  const inherited = useContext(SkeletonContext);
  const active = skeleton || inherited;
  useEffect(() => {
    if (!skeleton) return;
    alignPulses();
    // Text that is there draws as rounded, shimmering bars, as missing text does. The script that
    // measures it loads only once a skeleton shows; until it runs, CSS draws the text's fallback.
    let release: (() => void) | undefined;
    let left = false;
    void import('./internal/skeletonText.js').then(({ retainSkeletonText }) => {
      if (!left) release = retainSkeletonText();
    });
    return () => {
      left = true;
      release?.();
    };
  }, [skeleton]);
  return <SkeletonContext value={active}>{children}</SkeletonContext>;
}

/**
 * The status of a skeleton whose root can't hold a wrapper, such as a list, which is inert as a
 * whole: visually hidden beside it, it says what is loading, the list's label when it has one. The
 * text goes in once the status is in the page, so assistive technology announces it once.
 */
export function SkeletonStatus({ label }: { label?: string }) {
  const messages = useMessages('common', common);
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(true), []);
  return (
    <span className="env-skeleton-status" role="status">
      {shown ? (label ? `${messages.loading}: ${label}` : messages.loading) : ''}
    </span>
  );
}
