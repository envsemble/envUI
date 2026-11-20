'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Theme, useTheme } from '../../../foundations/Theme.js';
import { toast as toastMessages } from '../../../foundations/messages/toast.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { useFormatters } from '../../../internal/provider/useFormatters.js';
import { useDirection } from '../../../internal/provider/useDirection.js';
import type { ToastController } from './useToastController.js';
import {
  entrySetByController,
  toastText,
  type ToastEntry,
  type ToastObject,
} from './toastEntry.js';
import type { ToastPlacement } from '../toastTypes.js';
import { usePortalContainer } from '../../../internal/provider/PortalContainerContext.js';
import { useModalOpen } from '../../../internal/dialog/useModalPresence.js';
import { useToastGlide } from './useToastGlide.js';
import { ContainedToast } from './ContainedToast.js';
import { announcedByStatusAndAlertsInstead, LiveToast } from './LiveToast.js';
import { ToastQueuedCount } from './ToastButtons.js';
import { optionModule, useOptionModule } from '../../../internal/react/useOptionModule.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

const containedToastRootLoadedByContainedRegions = optionModule(
  () => import('./ContainedToastRoot.js'),
);

function idsWaitingBehindHiddenCount(toasts: readonly ToastObject[], limit: number) {
  const activeNewestFirst = toasts.filter(
    (toastObject) => toastObject.transitionStatus !== 'ending',
  );
  const dangersTakeTheirPlacesFirst = activeNewestFirst.filter(
    (toastObject) => toastObject.data?.tone === 'danger',
  ).length;
  let room = Math.max(limit - dangersTakeTheirPlacesFirst, 0);
  const limited = new Set<string>();
  for (const toastObject of activeNewestFirst) {
    if (toastObject.data?.tone === 'danger') continue;
    if (room > 0) room -= 1;
    else limited.add(toastObject.id);
  }
  return limited;
}

function useWaitingToasts(
  toasts: readonly ToastObject[],
  container: HTMLElement | null | undefined,
  visibleLimit: number,
  controller: ToastController,
  placement: ToastPlacement,
) {
  const held = useModalOpen(container);
  const limited = held
    ? new Set(toasts.map((toastObject) => toastObject.id))
    : idsWaitingBehindHiddenCount(toasts, visibleLimit);
  useLayoutEffect(() => {
    const visibleIds = new Set(
      toasts
        .filter(
          (toastObject) =>
            !limited.has(toastObject.id) && toastObject.transitionStatus !== 'ending',
        )
        .map((toastObject) => toastObject.id),
    );
    controller.setVisibleNotifications(placement, visibleIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, placement, toasts, visibleLimit, held]);
  const [shownOutsideModal, setShownOutsideModal] = useState<ReadonlySet<string>>(() => new Set());
  useLayoutEffect(() => {
    if (held || toasts.every((toastObject) => shownOutsideModal.has(toastObject.id))) return;
    setShownOutsideModal(new Set(toasts.map((toastObject) => toastObject.id)));
  }, [held, shownOutsideModal, toasts]);
  return { held, limited, shownOutsideModal };
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
  const [goneContainedToasts, setGoneContainedToasts] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const leave = useCallback(
    (id: string) => setGoneContainedToasts((current) => new Set(current).add(id)),
    [],
  );
  useLayoutEffect(
    () =>
      controller.registerPlacementStoreForControllersLifetime(placement, {
        add: toastStore.add,
        close: toastStore.close,
      }),
    [controller, placement, toastStore.add, toastStore.close],
  );
  const { held, limited, shownOutsideModal } = useWaitingToasts(
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
  const [direction] = useDirection(viewport, toastStore.toasts.length);
  const swipeTowardLineEnd = direction === 'rtl' ? 'left' : 'right';
  const swipeDirection: ('down' | 'left' | 'right')[] = ['down', swipeTowardLineEnd];
  const containedToastRoot = useOptionModule(
    containedToastRootLoadedByContainedRegions,
    contained,
  )?.ContainedToastRoot;
  const regionLabel =
    placement === 'bottom-end' ? messages.regionBottomEnd : messages.regionTopCenter;
  const politelyAnnounced = toastStore.toasts.filter(
    (toastObject) =>
      toastObject.data?.tone !== 'danger' &&
      toastObject.transitionStatus !== 'ending' &&
      (!held || shownOutsideModal.has(toastObject.id)),
  );
  const avoidBaseUiWindowWideF6 = contained;
  if (avoidBaseUiWindowWideF6)
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
              <ToastQueuedCount count={hiddenCount} label={hiddenLabel} live={false} />
            )}
            {containedToastRoot &&
              toastStore.toasts
                .filter((toastObject) => !goneContainedToasts.has(toastObject.id))
                .map((toastObject) => (
                  <ContainedToast
                    key={toastObject.id}
                    LoadedRoot={containedToastRoot}
                    toastObject={toastObject}
                    limited={limited.has(toastObject.id)}
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
          aria-live={announcedByStatusAndAlertsInstead}
          aria-label={regionLabel}
          onFocusCapture={(event) => {
            const viewportItselfFocusedByF6 =
              event.target === event.currentTarget && event.currentTarget.matches(':focus-visible');
            controller.setViewportFocused(placement, viewportItselfFocusedByF6);
          }}
          onBlurCapture={(event) => {
            if (
              event.target === event.currentTarget ||
              !event.currentTarget.contains(event.relatedTarget)
            )
              controller.setViewportFocused(placement, false);
          }}
        >
          {hiddenCount > 0 && <ToastQueuedCount count={hiddenCount} label={hiddenLabel} live />}
          {toastStore.toasts.map((toastObject) => (
            <LiveToast
              key={toastObject.id}
              toastObject={toastObject}
              limited={limited.has(toastObject.id)}
              swipeDirection={swipeDirection}
              controller={controller}
              dismissLabel={messages.dismiss}
            />
          ))}
        </BaseToast.Viewport>
        <div className="env-toast-announcer" role="status" aria-live="polite" aria-atomic="false">
          {politelyAnnounced.map((toastObject) => (
            <div key={toastObject.id}>
              {toastText(entrySetByController(toastObject)) ??
                entrySetByController(toastObject).message}
            </div>
          ))}
        </div>
      </Theme>
    </BaseToast.Portal>
  );
}
