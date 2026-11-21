'use client';

import { useContext, useEffect, useState, type ReactNode } from 'react';
import { useMessages } from '../provider/EnvUIContext.js';
import { common } from '../../foundations/messages/common.js';
import { SkeletonContext } from './SkeletonContext.js';
import '../../styles/Base.css';
import '../../styles/Skeleton.css';

/**
 * Puts every skeleton's pulse in step: each root runs its own animation, started when it
 * rendered, so their start times are moved to the document timeline's start.
 */
function alignPulses() {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') return;
  for (const animation of document.getAnimations()) {
    const target = (animation.effect as KeyframeEffect | null)?.target;
    const isCssAnimation = 'animationName' in animation;
    const scrollDriven = animation.timeline !== document.timeline;
    const isSkeletonPulse =
      isCssAnimation && !scrollDriven && target?.hasAttribute('data-env-skeleton');
    if (isSkeletonPulse && animation.startTime !== 0) animation.startTime = 0;
  }
}

let alignmentQueued = false;

function alignPulsesOnceForSkeletonsMountingTogether() {
  if (alignmentQueued) return;
  alignmentQueued = true;
  queueMicrotask(() => {
    alignmentQueued = false;
    alignPulses();
  });
}

/**
 * Tells the components inside a skeleton that they are in one, and keeps its pulse in step with
 * the others on the page. Every component that takes `skeleton` renders it around its content.
 */
export function SkeletonScope({ skeleton, children }: { skeleton: boolean; children?: ReactNode }) {
  const inherited = useContext(SkeletonContext);
  const active = skeleton || inherited;
  useEffect(() => {
    if (!skeleton) return;
    alignPulsesOnceForSkeletonsMountingTogether();
    let releaseSkeletonText: (() => void) | undefined;
    let unmounted = false;
    void import('./skeletonText.js').then(({ retainSkeletonText }) => {
      if (!unmounted) releaseSkeletonText = retainSkeletonText();
    });
    return () => {
      unmounted = true;
      releaseSkeletonText?.();
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
