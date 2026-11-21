'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { Toast as BaseToast } from '@base-ui/react/toast';
import { motionDuration, motionEasing } from '../../../internal/motion/motionTokens.js';
import { prefersReducedMotion } from '../../../internal/motion/reducedMotion.js';
import type { ToastEntry } from './toastEntry.js';
import type { ToastPlacement } from '../toastTypes.js';
import { pixelsOf } from '../../../internal/dom/lengths.js';

const glideId = 'env-toast-glide';
const revealId = 'env-toast-reveal';

function runningGlideOffset(item: HTMLElement) {
  const [, y = '0'] = getComputedStyle(item).translate.split(' ');
  return pixelsOf(y);
}

function animationsOf(item: HTMLElement) {
  return item.getAnimations?.() ?? [];
}

const noticesAndHiddenCountOf = (viewport: HTMLElement) =>
  Array.from(viewport.querySelectorAll<HTMLElement>(':scope > [data-toast-id]'));

const toastIdOf = (stackItem: HTMLElement) => stackItem.dataset.toastId!;

export function useToastGlide(
  toasts: readonly BaseToast.Root.ToastObject<ToastEntry>[],
  placement: ToastPlacement,
  hiddenCount: number,
  heldByModal: boolean,
) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const positions = useRef(new Map<string, number>());
  const hiddenIds = useRef(new Set<string>());
  const stopScrollbarFlashWhileFittingStackMoves = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const moving = noticesAndHiddenCountOf(element).some(
      (item) =>
        item.hasAttribute('data-leaving') ||
        animationsOf(item).some((animation) => animation.playState === 'running'),
    );
    const limit = Number.parseFloat(getComputedStyle(element).maxBlockSize);
    const tallerThanItsLimitKeepsScrolling =
      !element.hasAttribute('data-settling') &&
      element.scrollHeight > element.clientHeight + 1 &&
      element.offsetHeight >= limit - 1;
    element.toggleAttribute('data-settling', moving && !tallerThanItsLimitKeepsScrolling);
  }, []);
  const attachViewport = useCallback(
    (element: HTMLDivElement | null) => {
      const events = ['transitionrun', 'transitionend', 'transitioncancel'];
      for (const event of events)
        viewport.current?.removeEventListener(event, stopScrollbarFlashWhileFittingStackMoves);
      viewport.current = element;
      for (const event of events)
        element?.addEventListener(event, stopScrollbarFlashWhileFittingStackMoves);
    },
    [stopScrollbarFlashWhileFittingStackMoves],
  );
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const webAnimationsAvailable = typeof element.animate === 'function';
    const easing = webAnimationsAvailable ? motionEasing(element, 'ease-enter') : '';
    const revealDuration = webAnimationsAvailable ? motionDuration(element, 'medium') : 0;
    const glideDuration =
      webAnimationsAvailable && !prefersReducedMotion() ? motionDuration(element, 'slow') : 0;
    const leavingIds = new Set(
      toasts.filter((toast) => toast.transitionStatus === 'ending').map((toast) => toast.id),
    );
    const items = noticesAndHiddenCountOf(element);
    const viewportLayoutOffsetBefore = { left: element.offsetLeft, top: element.offsetTop };
    const leavingPinnedWhereDrawn = items
      .filter((item) => leavingIds.has(toastIdOf(item)) && !item.hasAttribute('data-leaving'))
      .map((item) => {
        const fractionalSizeSoTheMessageDoesNotWrap = getComputedStyle(item);
        const left = viewportLayoutOffsetBefore.left + item.offsetLeft;
        const top = viewportLayoutOffsetBefore.top + item.offsetTop + runningGlideOffset(item);
        const right = left + Number.parseFloat(fractionalSizeSoTheMessageDoesNotWrap.width);
        const height = Number.parseFloat(fractionalSizeSoTheMessageDoesNotWrap.height);
        return { item, left, top, right, bottom: top + height };
      });
    for (const { item, left, right } of leavingPinnedWhereDrawn) {
      for (const animation of animationsOf(item)) if (animation.id === glideId) animation.cancel();
      item.style.width = `${right - left}px`;
      item.setAttribute('data-leaving', '');
    }
    const physicalBox = {
      left: element.offsetLeft,
      top: element.offsetTop,
      right: element.offsetLeft + element.offsetWidth,
      bottom: element.offsetTop + element.offsetHeight,
    };
    for (const pin of leavingPinnedWhereDrawn) {
      if (placement === 'bottom-end') {
        pin.item.style.bottom = `${physicalBox.bottom - pin.bottom}px`;
        pin.item.style.right = `${physicalBox.right - pin.right}px`;
      } else {
        pin.item.style.top = `${pin.top - physicalBox.top}px`;
        pin.item.style.left = `${pin.left - physicalBox.left}px`;
      }
    }
    const next = new Map<string, number>();
    const hidden = new Set<string>();
    for (const item of items) {
      const id = toastIdOf(item);
      if (item.hasAttribute('data-leaving')) continue;
      if (item.hasAttribute('data-limited')) {
        hidden.add(id);
        continue;
      }
      const layoutTopOnPage = physicalBox.top + item.offsetTop;
      const previous = positions.current.get(id);
      next.set(id, layoutTopOnPage);
      if (previous === undefined) {
        const revealedFromHidden = hiddenIds.current.has(id);
        if (revealDuration > 0 && revealedFromHidden)
          item
            .animate([{ opacity: 0 }, { opacity: 1 }], {
              id: revealId,
              duration: revealDuration,
              easing,
            })
            .finished.then(
              stopScrollbarFlashWhileFittingStackMoves,
              stopScrollbarFlashWhileFittingStackMoves,
            );
        continue;
      }
      if (glideDuration === 0 || Math.abs(previous - layoutTopOnPage) < 1) continue;
      const interruptedGlideOffset = runningGlideOffset(item);
      for (const animation of animationsOf(item)) if (animation.id === glideId) animation.cancel();
      item
        .animate(
          [
            { translate: `0 ${previous + interruptedGlideOffset - layoutTopOnPage}px` },
            { translate: '0 0' },
          ],
          {
            id: glideId,
            duration: glideDuration,
            easing,
          },
        )
        .finished.then(
          stopScrollbarFlashWhileFittingStackMoves,
          stopScrollbarFlashWhileFittingStackMoves,
        );
    }
    positions.current = next;
    hiddenIds.current = hidden;
    stopScrollbarFlashWhileFittingStackMoves();
  }, [toasts, hiddenCount, heldByModal, placement, stopScrollbarFlashWhileFittingStackMoves]);
  return [viewport, attachViewport] as const;
}
