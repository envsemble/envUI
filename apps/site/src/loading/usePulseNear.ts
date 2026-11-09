import { useEffect, type RefObject } from 'react';
import { scrollerOf } from '../shared/Idle';

/** How far from the view a skeleton pulses on, as a share of the view's height. */
const pulseMargin = '50% 0px';

/**
 * Stops a skeleton's pulse while it is far from the view (`data-site-far`, Loading.css), and puts
 * it back in step with the others as it nears the view again, before it shows. Every skeleton's
 * pulse restyles everything in it on every frame: a pre-rendered page holds a skeleton for each
 * figure until it nears the view (figures/useSubjectShown.ts), and the frames of those far below
 * it, which no one sees pulse, would hold up the page.
 */
export function usePulseNear(skeleton: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = skeleton.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const near = entries.at(-1)?.isIntersecting;
        if (!near) return element.setAttribute('data-site-far', '');
        if (!element.hasAttribute('data-site-far')) return;
        element.removeAttribute('data-site-far');
        // Its pulse starts again: on the document's timeline from its start, as every skeleton's
        // is (alignPulses, the library's SkeletonScope.tsx).
        for (const root of [element, ...element.querySelectorAll('[data-env-skeleton]')])
          for (const animation of root.getAnimations())
            if ('animationName' in animation && animation.timeline === document.timeline)
              animation.startTime = 0;
      },
      { root: scrollerOf(element), rootMargin: pulseMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [skeleton]);
}
