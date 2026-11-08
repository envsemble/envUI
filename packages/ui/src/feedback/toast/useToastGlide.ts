'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { Toast as BaseToast } from '@base-ui/react/toast';
import { motionDuration, motionEasing } from '../../internal/motionTokens.js';
import { prefersReducedMotion } from '../../internal/reducedMotion.js';
import type { ToastEntry } from './toastInternals.js';
import type { ToastPlacement } from './toastTypes.js';

const glideId = 'env-toast-glide';
const revealId = 'env-toast-reveal';

/** The vertical offset a running glide currently adds to a notice. */
function glideOffset(item: HTMLElement) {
  const [, y = '0'] = getComputedStyle(item).translate.split(' ');
  return Number.parseFloat(y) || 0;
}

/** A notice's running animations; none where the Web Animations API is missing, such as jsdom. */
function animationsOf(item: HTMLElement) {
  return item.getAnimations?.() ?? [];
}

/** The notices in a viewport, the count of hidden ones among them. */
const noticesOf = (viewport: HTMLElement) =>
  Array.from(viewport.querySelectorAll<HTMLElement>(':scope > [data-toast-id]'));

/**
 * The motion of a region's stack: when notices arrive or leave, the others glide from their
 * previous position instead of jumping, a leaving notice fades where it was drawn, and one revealed
 * from the hidden ones fades in. Returns the viewport's ref and the ref callback that attaches it.
 */
export function useToastGlide(
  toasts: readonly BaseToast.Root.ToastObject<ToastEntry>[],
  placement: ToastPlacement,
  /** How many notices are hidden, and whether a modal holds them all: they change which glide. */
  hiddenCount: number,
  held: boolean,
) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const positions = useRef(new Map<string, number>());
  const hiddenIds = useRef(new Set<string>());
  // While notices move, appear or leave they may reach past the stack's box for a moment. A stack
  // that fits stops scrolling then, so no scrollbar flashes and nothing shifts sideways; a stack
  // taller than the window keeps scrolling, and its scroll position, throughout.
  const settle = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const moving = noticesOf(element).some(
      (item) =>
        item.hasAttribute('data-leaving') ||
        animationsOf(item).some((animation) => animation.playState === 'running'),
    );
    const limit = Number.parseFloat(getComputedStyle(element).maxBlockSize);
    const overflowing =
      !element.hasAttribute('data-settling') &&
      element.scrollHeight > element.clientHeight + 1 &&
      element.offsetHeight >= limit - 1;
    element.toggleAttribute('data-settling', moving && !overflowing);
  }, []);
  // The viewport mounts in a portal, so its transition listeners follow the element itself.
  const attachViewport = useCallback(
    (element: HTMLDivElement | null) => {
      const events = ['transitionrun', 'transitionend', 'transitioncancel'];
      for (const event of events) viewport.current?.removeEventListener(event, settle);
      viewport.current = element;
      for (const event of events) element?.addEventListener(event, settle);
    },
    [settle],
  );
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    // Without the Web Animations API, such as in jsdom, notices move without motion, and so they do
    // where the application sets the motion tokens to 0s. The glide takes the slow duration, a
    // revealed notice's fade the medium one, both decelerating as notices entering do.
    const animates = typeof element.animate === 'function';
    const easing = animates ? motionEasing(element, 'ease-enter') : '';
    const revealDuration = animates ? motionDuration(element, 'medium') : 0;
    const glideDuration = animates && !prefersReducedMotion() ? motionDuration(element, 'slow') : 0;
    const leavingIds = new Set(
      toasts.filter((toast) => toast.transitionStatus === 'ending').map((toast) => toast.id),
    );
    const items = noticesOf(element);
    // A leaving notice steps out of the stack at once and fades where it was drawn. The others then
    // move into its place in a single glide, and a notice revealed from the hidden ones takes its
    // turn, instead of the stack growing while the notice fades and shrinking after. Its layout box
    // is pinned, so a running entrance or exit transform carries on from where it is.
    // Everything is measured in layout px, the viewport's offsets and the notices' within it, never
    // the drawn boxes, which a transform or zoom around the region scales.
    const before = { left: element.offsetLeft, top: element.offsetTop };
    const pins = items
      // Each item the selector finds carries data-toast-id.
      .filter((item) => leavingIds.has(item.dataset.toastId!) && !item.hasAttribute('data-leaving'))
      .map((item) => {
        // The computed size is fractional, unlike offsetWidth: a notice is max-content wide, so a
        // rounded-down width would wrap its message while it fades.
        const size = getComputedStyle(item);
        const left = before.left + item.offsetLeft;
        const top = before.top + item.offsetTop + glideOffset(item);
        const right = left + Number.parseFloat(size.width);
        return { item, left, top, right, bottom: top + Number.parseFloat(size.height) };
      });
    for (const { item, left, right } of pins) {
      for (const animation of animationsOf(item)) if (animation.id === glideId) animation.cancel();
      item.style.width = `${right - left}px`;
      item.setAttribute('data-leaving', '');
    }
    const box = {
      left: element.offsetLeft,
      top: element.offsetTop,
      right: element.offsetLeft + element.offsetWidth,
      bottom: element.offsetTop + element.offsetHeight,
    };
    for (const pin of pins) {
      // Physical sides: the measurements are physical, whatever the writing direction.
      if (placement === 'bottom-end') {
        pin.item.style.bottom = `${box.bottom - pin.bottom}px`;
        pin.item.style.right = `${box.right - pin.right}px`;
      } else {
        pin.item.style.top = `${pin.top - box.top}px`;
        pin.item.style.left = `${pin.left - box.left}px`;
      }
    }
    const next = new Map<string, number>();
    const hidden = new Set<string>();
    for (const item of items) {
      // noticesOf finds the notices by their data-toast-id.
      const id = item.dataset.toastId!;
      if (item.hasAttribute('data-leaving')) continue;
      if (item.hasAttribute('data-limited')) {
        hidden.add(id);
        continue;
      }
      // Layout positions on the page: the viewport grows from its anchored edge, so offsets within
      // it are not enough. offsetTop ignores transforms, entrance motion and running glides alike.
      const top = box.top + item.offsetTop;
      const previous = positions.current.get(id);
      next.set(id, top);
      if (previous === undefined) {
        // Revealed from the hidden ones, the notice fades in; new notices have their own entrance.
        if (revealDuration > 0 && hiddenIds.current.has(id))
          item
            .animate([{ opacity: 0 }, { opacity: 1 }], {
              id: revealId,
              duration: revealDuration,
              easing,
            })
            .finished.then(settle, settle);
        continue;
      }
      if (glideDuration === 0 || Math.abs(previous - top) < 1) continue;
      // Start where the notice was drawn before this change, including an interrupted glide.
      const offset = glideOffset(item);
      for (const animation of animationsOf(item)) if (animation.id === glideId) animation.cancel();
      item
        .animate([{ translate: `0 ${previous + offset - top}px` }, { translate: '0 0' }], {
          id: glideId,
          duration: glideDuration,
          easing,
        })
        .finished.then(settle, settle);
    }
    positions.current = next;
    hiddenIds.current = hidden;
    settle();
  }, [toasts, hiddenCount, held, placement, settle]);
  return [viewport, attachViewport] as const;
}
