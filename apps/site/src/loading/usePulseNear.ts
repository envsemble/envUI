import { useEffect, useRef, type RefObject } from 'react';
import { scrollerOf } from '../shared/Idle';

const pulseNearMargin = '50% 0px';

function restartPulseInStep(element: Element) {
  for (const root of [element, ...element.querySelectorAll('[data-env-skeleton]')])
    for (const animation of root.getAnimations())
      if ('animationName' in animation && animation.timeline === document.timeline)
        animation.startTime = 0;
}

export function usePulseNear(
  skeleton: RefObject<HTMLElement | null>,
  onReport?: (near: boolean) => void,
) {
  const report = useRef(onReport);
  report.current = onReport;
  useEffect(() => {
    const element = skeleton.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const near = Boolean(entries.at(-1)?.isIntersecting);
        report.current?.(near);
        if (!near) return element.setAttribute('data-site-far', '');
        if (!element.hasAttribute('data-site-far')) return;
        element.removeAttribute('data-site-far');
        restartPulseInStep(element);
      },
      { root: scrollerOf(element), rootMargin: pulseNearMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [skeleton]);
}
