'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Badge } from '../../data-display/Badge.js';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { toast as toastMessages } from '../../foundations/messages/toast.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useFormatters } from '../../internal/useFormatters.js';
import { useDirection } from '../../internal/useDirection.js';
import type { ToastController } from './useToastController.js';
import type { ToastEntry } from './toastInternals.js';
import type { ToastPlacement } from './toastTypes.js';
import { usePortalContainer } from '../../internal/PortalContainerContext.js';
import { useModalOpen } from '../../overlays/internal/useModalPresence.js';
import { Button, IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import { flag } from '../../internal/flag.js';
import { ToastBody } from './ToastBody.js';
import { PictureNotice } from './PictureNotice.js';
import { useToastGlide } from './useToastGlide.js';
import '../../styles/Base.css';
import '../../styles/Toast.css';

type ToastObject = BaseToast.Root.ToastObject<ToastEntry>;

/**
 * The notices that wait behind the count of hidden ones: the oldest beyond the visible limit. Danger
 * notices are never among them; they take their places first.
 */
function limitedIds(toasts: readonly ToastObject[], limit: number) {
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

/**
 * Which notices wait, hidden and paused, and which showed: the controller hears which show, so only
 * their time runs.
 */
function useWaitingToasts(
  toasts: readonly ToastObject[],
  container: HTMLElement | null | undefined,
  visibleLimit: number,
  controller: ToastController,
  placement: ToastPlacement,
) {
  // While a modal surface is open in the same container, every notice waits, hidden and paused as
  // the ones past the limit are, and shows for its full duration once the last one has closed: over
  // the modal it would cover its actions, and the page around a modal can't be reached.
  const held = useModalOpen(container);
  const limited = held
    ? new Set(toasts.map((toast) => toast.id))
    : limitedIds(toasts, visibleLimit);
  useLayoutEffect(() => {
    const visibleIds = new Set(
      toasts
        .filter((toast) => !limited.has(toast.id) && toast.transitionStatus !== 'ending')
        .map((toast) => toast.id),
    );
    controller.setVisibleNotifications(placement, visibleIds);
    // The limited set follows from the toasts and the limit, which the dependencies cover.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, placement, toasts, visibleLimit, held]);
  // The notices that showed while no modal was open: the status reads them as they arrive, and one
  // that arrives while a modal is open is read once it shows.
  const [shown, setShown] = useState<ReadonlySet<string>>(() => new Set());
  useLayoutEffect(() => {
    if (held || toasts.every((toast) => shown.has(toast.id))) return;
    setShown(new Set(toasts.map((toast) => toast.id)));
  }, [held, shown, toasts]);
  return { held, limited, shown };
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
  const { container, contained } = usePortalContainer();
  const messages = useMessages('toast', toastMessages);
  const number = useFormatters().number();
  // The notices of a picture that have left; Base UI's own notices leave by themselves.
  const [gone, setGone] = useState<ReadonlySet<string>>(() => new Set());
  const leave = useCallback((id: string) => setGone((current) => new Set(current).add(id)), []);
  useLayoutEffect(
    () =>
      controller.registerPlacementStore(placement, {
        add: toastStore.add,
        close: toastStore.close,
      }),
    [controller, placement, toastStore.add, toastStore.close],
  );
  // Its effects run after the registration, which delivers the notices that waited for the store.
  const { held, limited, shown } = useWaitingToasts(
    toastStore.toasts,
    container,
    visibleLimit,
    controller,
    placement,
  );
  const hiddenCount = held ? 0 : limited.size;
  const hiddenLabel =
    hiddenCount > 0
      ? messages.hidden({ count: hiddenCount, countText: number.format(hiddenCount) })
      : undefined;
  const [viewport, attachViewport] = useToastGlide(toastStore.toasts, placement, hiddenCount, held);
  // A swipe toward the end of the line dismisses, so it is to the left in right-to-left text.
  const [direction] = useDirection(viewport, toastStore.toasts.length);
  const swipeDirection: ('down' | 'left' | 'right')[] = [
    'down',
    direction === 'rtl' ? 'left' : 'right',
  ];
  const regionLabel =
    placement === 'bottom-end' ? messages.regionBottomEnd : messages.regionTopCenter;
  // In a contained PortalContainer the notices are a picture of the region, part of the container:
  // without Base UI's viewport, whose window-wide F6 would take the page's F6 for a region that is
  // only shown. They keep their look, action, dismiss button and duration, arrive and leave with
  // their motion, and stay while the pointer rests on them.
  if (contained)
    return (
      <BaseToast.Portal container={container}>
        <Theme {...theme} className="env-toast-theme">
          <div
            ref={attachViewport}
            className="env-toast-viewport"
            data-placement={placement}
            role="region"
            aria-label={regionLabel}
          >
            {hiddenCount > 0 && (
              <Badge
                className="env-toast-queued-count"
                data-toast-id="queued"
                count={`+${hiddenCount}`}
                aria-label={hiddenLabel}
              />
            )}
            {toastStore.toasts
              .filter((toast) => !gone.has(toast.id))
              .map((toast) => (
                <PictureToast
                  key={toast.id}
                  toast={toast}
                  limited={limited.has(toast.id)}
                  controller={controller}
                  dismissLabel={messages.dismiss}
                  onClose={toastStore.close}
                  onGone={leave}
                />
              ))}
          </div>
        </Theme>
      </BaseToast.Portal>
    );
  return (
    <BaseToast.Portal container={container}>
      <Theme {...theme} className="env-toast-theme">
        <BaseToast.Viewport
          ref={attachViewport}
          className="env-toast-viewport"
          data-placement={placement}
          // The region announces nothing itself: a danger notice is an alert of its own, and the
          // others are read by the status below, so no notice is read twice.
          aria-live="off"
          aria-label={regionLabel}
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
            <Badge
              className="env-toast-queued-count"
              data-toast-id="queued"
              role="status"
              count={`+${hiddenCount}`}
              aria-label={hiddenLabel}
            />
          )}
          {toastStore.toasts.map((toast) => (
            <LiveToast
              key={toast.id}
              toast={toast}
              limited={limited.has(toast.id)}
              swipeDirection={swipeDirection}
              controller={controller}
              dismissLabel={messages.dismiss}
            />
          ))}
        </BaseToast.Viewport>
        {/* The ordinary notices, read politely as they arrive; a danger notice is an alert. */}
        <div className="env-toast-announcer" role="status" aria-live="polite" aria-atomic="false">
          {toastStore.toasts
            .filter(
              (toast) =>
                toast.data?.tone !== 'danger' &&
                toast.transitionStatus !== 'ending' &&
                (!held || shown.has(toast.id)),
            )
            // Every notice carries its entry as the data (useToastController).
            .map((toast) => (
              <div key={toast.id}>{toast.data!.message}</div>
            ))}
        </div>
      </Theme>
    </BaseToast.Portal>
  );
}

/**
 * A notice of a contained region's picture: its look, action, dismiss button and duration, without
 * Base UI's parts.
 */
function PictureToast({
  toast,
  limited,
  controller,
  dismissLabel,
  onClose,
  onGone,
}: {
  toast: ToastObject;
  limited: boolean;
  controller: ToastController;
  dismissLabel: string;
  onClose: (id: string) => void;
  onGone: (id: string) => void;
}) {
  // Every notice carries its entry as the data (useToastController).
  const entry = toast.data!;
  return (
    <PictureNotice
      id={toast.id}
      tone={entry.tone}
      limited={limited}
      ending={toast.transitionStatus === 'ending'}
      controller={controller}
      onGone={onGone}
    >
      <ToastBody
        tone={entry.tone}
        message={<div className="env-toast-message">{entry.message}</div>}
        action={
          entry.action && (
            <Button variant="outline" className="env-toast-action" onClick={entry.action.onClick}>
              {entry.action.label}
            </Button>
          )
        }
        dismiss={
          entry.dismissible !== false && (
            <IconButton
              variant="ghost"
              icon={<IconClose />}
              className="env-toast-dismiss"
              aria-label={dismissLabel}
              onClick={() => onClose(toast.id)}
            />
          )
        }
      />
    </PictureNotice>
  );
}

/**
 * A notice in Base UI's viewport, whose time stops while the pointer rests on it or keyboard focus
 * is in it; one past the visible limit waits, hidden and inert.
 */
function LiveToast({
  toast,
  limited,
  swipeDirection,
  controller,
  dismissLabel,
}: {
  toast: ToastObject;
  limited: boolean;
  swipeDirection: ('down' | 'left' | 'right')[];
  controller: ToastController;
  dismissLabel: string;
}) {
  // Every notice carries its entry as the data (useToastController).
  const entry = toast.data!;
  const danger = entry.tone === 'danger';
  return (
    <BaseToast.Root
      toast={toast}
      data-toast-id={toast.id}
      className="env-toast"
      data-tone={entry.tone}
      swipeDirection={swipeDirection}
      data-limited={flag(limited)}
      inert={limited || undefined}
      // A danger notice interrupts: it is an alert as it appears, outside any polite region, and
      // stays readable.
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
                <Button
                  variant="outline"
                  className="env-toast-action"
                  onClick={entry.action.onClick}
                />
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
                <IconButton
                  variant="ghost"
                  icon={<IconClose />}
                  className="env-toast-dismiss"
                  aria-label={dismissLabel}
                />
              }
            />
          )
        }
      />
    </BaseToast.Root>
  );
}
