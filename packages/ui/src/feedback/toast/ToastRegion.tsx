'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button } from '../../actions/Button.js';
import { CounterBadge } from '../../content/CounterBadge.js';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { Close } from '../../icons/Close.js';
import { ToastBody } from './ToastBody.js';
import type { ToastController } from './useToastController.js';
import type { ToastEntry } from './ToastInternals.js';
import type { ToastPlacement } from './ToastTypes.js';

const glideId = 'env-toast-glide';
const revealId = 'env-toast-reveal';
const glideEasing = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

/** The vertical offset a running glide currently adds to a notice. */
function glideOffset(item: HTMLElement) {
  const [, y = '0'] = getComputedStyle(item).translate.split(' ');
  return Number.parseFloat(y) || 0;
}

/** A notice's running animations; none where the Web Animations API is missing, such as jsdom. */
function animationsOf(item: HTMLElement) {
  return item.getAnimations?.() ?? [];
}

export function ToastRegion({
  placement,
  controller,
}: {
  placement: ToastPlacement;
  controller: ToastController;
}) {
  const toastStore = BaseToast.useToastManager<ToastEntry>();
  const theme = useTheme();
  const viewport = useRef<HTMLDivElement | null>(null);
  const positions = useRef(new Map<string, number>());
  const hiddenCount = toastStore.toasts.filter(
    (toast) => toast.limited && toast.transitionStatus !== 'ending',
  ).length;
  useLayoutEffect(
    () =>
      controller.registerPlacementStore(placement, {
        add: toastStore.add,
        close: toastStore.close,
      }),
    [controller, placement, toastStore.add, toastStore.close],
  );
  useLayoutEffect(() => {
    const visibleIds = new Set(
      toastStore.toasts
        .filter((toast) => !toast.limited && toast.transitionStatus !== 'ending')
        .map((toast) => toast.id),
    );
    controller.setVisibleNotifications(placement, visibleIds);
  }, [controller, placement, toastStore.toasts]);
  const hiddenIds = useRef(new Set<string>());
  // While notices move, appear or leave they may reach past the stack's box for a moment. A stack
  // that fits stops scrolling then, so no scrollbar flashes and nothing shifts sideways; a stack
  // taller than the window keeps scrolling, and its scroll position, throughout.
  const settle = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const moving = Array.from(
      element.querySelectorAll<HTMLElement>(':scope > [data-toast-id]'),
    ).some(
      (item) =>
        item.hasAttribute('data-leaving') ||
        animationsOf(item).some((animation) => animation.playState === 'running'),
    );
    const limit = Number.parseFloat(getComputedStyle(element).maxBlockSize);
    const overflowing =
      !element.hasAttribute('data-settling') &&
      element.scrollHeight > element.clientHeight + 1 &&
      element.getBoundingClientRect().height >= limit - 1;
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
  // When notices arrive or leave, the others glide from their previous position instead of jumping.
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    // Without the Web Animations API, such as in jsdom, notices move without motion.
    const animates = typeof element.animate === 'function';
    const glide = animates && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const leavingIds = new Set(
      toastStore.toasts
        .filter((toast) => toast.transitionStatus === 'ending')
        .map((toast) => toast.id),
    );
    const items = Array.from(element.querySelectorAll<HTMLElement>(':scope > [data-toast-id]'));
    // A leaving notice steps out of the stack at once and fades where it was drawn. The others then
    // move into its place in a single glide, and a notice revealed from the hidden ones takes its
    // turn, instead of the stack growing while the notice fades and shrinking after. Its layout box
    // is pinned, so a running entrance or exit transform carries on from where it is.
    const before = element.getBoundingClientRect();
    const pins = items
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
    const box = element.getBoundingClientRect();
    for (const pin of pins) {
      // Physical sides: the measurements are physical, whatever the writing direction.
      if (placement === 'bottom-right') {
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
        if (animates && hiddenIds.current.has(id))
          item
            .animate([{ opacity: 0 }, { opacity: 1 }], {
              id: revealId,
              duration: 200,
              easing: glideEasing,
            })
            .finished.then(settle, settle);
        continue;
      }
      if (!glide || Math.abs(previous - top) < 1) continue;
      // Start where the notice was drawn before this change, including an interrupted glide.
      const offset = glideOffset(item);
      for (const animation of animationsOf(item)) if (animation.id === glideId) animation.cancel();
      item
        .animate([{ translate: `0 ${previous + offset - top}px` }, { translate: '0 0' }], {
          id: glideId,
          duration: 240,
          easing: glideEasing,
        })
        .finished.then(settle, settle);
    }
    positions.current = next;
    hiddenIds.current = hidden;
    settle();
  }, [toastStore.toasts, hiddenCount, placement, settle]);
  return (
    <BaseToast.Portal>
      <Theme {...theme} className="env-toast-portal-theme">
        <BaseToast.Viewport
          ref={attachViewport}
          className={`env-toast-viewport env-toast-viewport-${placement}`}
          aria-label={
            placement === 'bottom-right' ? 'Bottom right notifications' : 'Top center notifications'
          }
          onFocusCapture={(event) => {
            // F6 focuses the viewport itself. Focus inside a toast pauses only that toast.
            controller.setViewportFocused(
              placement,
              event.target === event.currentTarget && event.currentTarget.matches(':focus-visible'),
            );
          }}
          onBlurCapture={(event) => {
            if (
              event.target === event.currentTarget ||
              !event.currentTarget.contains(event.relatedTarget)
            )
              controller.setViewportFocused(placement, false);
          }}
        >
          {hiddenCount > 0 && (
            <CounterBadge
              className="env-toast-queued-count"
              data-toast-id="queued"
              role="status"
              value={`+${hiddenCount}`}
              aria-label={`${hiddenCount} older notification${hiddenCount === 1 ? '' : 's'} hidden`}
            />
          )}
          {toastStore.toasts.map((toast) => {
            const entry = toast.data!;
            return (
              <BaseToast.Root
                key={toast.id}
                toast={toast}
                data-toast-id={toast.id}
                className={`env-toast env-toast-${entry.variant}`}
                onMouseEnter={() => controller.pause(toast.id, 'hover')}
                onMouseLeave={() => controller.resume(toast.id, 'hover')}
                onFocusCapture={(event) => {
                  if (event.target instanceof Element && event.target.matches(':focus-visible'))
                    controller.pause(toast.id, 'focus');
                  else controller.resume(toast.id, 'focus');
                }}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    controller.resume(toast.id, 'focus');
                }}
              >
                <ToastBody
                  variant={entry.variant}
                  message={<BaseToast.Title className="env-toast-message" title={entry.message} />}
                  action={
                    entry.action && (
                      <BaseToast.Action
                        render={
                          <Button className="env-toast-action" onClick={entry.action.onClick} />
                        }
                      >
                        {entry.action.label}
                      </BaseToast.Action>
                    )
                  }
                  dismiss={
                    entry.dismissible !== false && (
                      <BaseToast.Close
                        className="env-toast-dismiss"
                        aria-hidden={false}
                        aria-label="Dismiss notification"
                      >
                        <span className="env-icon">
                          <Close />
                        </span>
                      </BaseToast.Close>
                    )
                  }
                />
              </BaseToast.Root>
            );
          })}
        </BaseToast.Viewport>
      </Theme>
    </BaseToast.Portal>
  );
}
