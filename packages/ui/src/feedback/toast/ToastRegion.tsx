'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button } from '../../actions/Button.js';
import { CloseButton } from '../../actions/CloseButton.js';
import { CounterBadge } from '../../content/CounterBadge.js';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { toast as toastMessages } from '../../foundations/messages/toast.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useDirection } from '../../internal/useDirection.js';
import { ToastBody } from './ToastBody.js';
import type { ToastController } from './useToastController.js';
import type { ToastEntry } from './ToastInternals.js';
import type { ToastPlacement } from './ToastTypes.js';
import { usePortalContainer } from '../../internal/PortalContainerContext.js';

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

/**
 * The notices that wait behind the count of hidden ones: the oldest beyond the visible limit. Danger
 * notices are never among them; they take their places first.
 */
function limitedIds(toasts: readonly BaseToast.Root.ToastObject<ToastEntry>[], limit: number) {
  const active = toasts.filter((toast) => toast.transitionStatus !== 'ending');
  const dangers = active.filter((toast) => toast.data?.tone === 'danger').length;
  let room = Math.max(limit - dangers, 0);
  const limited = new Set<string>();
  // Newest first, as Base UI keeps them.
  for (const toast of active) {
    if (toast.data?.tone === 'danger') continue;
    if (room > 0) room -= 1;
    else limited.add(toast.id);
  }
  return limited;
}

export function ToastRegion({
  placement,
  controller,
  visibleLimit,
}: {
  placement: ToastPlacement;
  controller: ToastController;
  visibleLimit: number;
}) {
  const toastStore = BaseToast.useToastManager<ToastEntry>();
  const theme = useTheme();
  const { container } = usePortalContainer();
  const messages = useMessages('toast', toastMessages);
  const viewport = useRef<HTMLDivElement | null>(null);
  const positions = useRef(new Map<string, number>());
  const limited = limitedIds(toastStore.toasts, visibleLimit);
  // A swipe toward the end of the line dismisses, so it is to the left in right-to-left text.
  const [direction] = useDirection(viewport, toastStore.toasts.length);
  const swipeDirection: ('down' | 'left' | 'right')[] = [
    'down',
    direction === 'rtl' ? 'left' : 'right',
  ];
  const hiddenCount = limited.size;
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
        .filter((toast) => !limited.has(toast.id) && toast.transitionStatus !== 'ending')
        .map((toast) => toast.id),
    );
    controller.setVisibleNotifications(placement, visibleIds);
    // The limited set follows from the toasts and the limit, which the dependencies cover.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, placement, toastStore.toasts, visibleLimit]);
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
    <BaseToast.Portal container={container}>
      <Theme {...theme} className="env-toast-portal-theme">
        <BaseToast.Viewport
          ref={attachViewport}
          className="env-toast-viewport"
          data-placement={placement}
          // The region announces nothing itself: a danger notice is an alert of its own, and the
          // others are read by the status below, so no notice is read twice.
          aria-live="off"
          aria-label={
            placement === 'bottom-end' ? messages.regionBottomEnd : messages.regionTopCenter
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
              aria-label={messages.hidden({ count: hiddenCount })}
            />
          )}
          {toastStore.toasts.map((toast) => {
            const entry = toast.data!;
            const isLimited = limited.has(toast.id);
            const danger = entry.tone === 'danger';
            return (
              <BaseToast.Root
                key={toast.id}
                toast={toast}
                data-toast-id={toast.id}
                className="env-toast"
                data-tone={entry.tone}
                swipeDirection={swipeDirection}
                data-limited={isLimited || undefined}
                inert={isLimited || undefined}
                // A danger notice interrupts: it is an alert as it appears, outside any polite
                // region, and stays readable.
                {...(danger && { role: 'alert', 'aria-modal': undefined })}
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
                  tone={entry.tone}
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
                        aria-hidden={false}
                        render={
                          <CloseButton
                            className="env-toast-dismiss"
                            aria-label={messages.dismiss}
                          />
                        }
                      />
                    )
                  }
                />
              </BaseToast.Root>
            );
          })}
        </BaseToast.Viewport>
        {/* The ordinary notices, read politely as they arrive; a danger notice is an alert. */}
        <div className="env-toast-announcer" role="status" aria-live="polite" aria-atomic="false">
          {toastStore.toasts
            .filter((toast) => toast.data?.tone !== 'danger' && toast.transitionStatus !== 'ending')
            .map((toast) => (
              <div key={toast.id}>{toast.data!.message}</div>
            ))}
        </div>
      </Theme>
    </BaseToast.Portal>
  );
}
