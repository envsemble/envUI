'use client';

import { Fragment, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Badge } from '../../../data-display/Badge.js';
import { Theme, useTheme } from '../../../foundations/Theme.js';
import { toast as toastMessages } from '../../../foundations/messages/toast.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { useFormatters } from '../../../internal/provider/useFormatters.js';
import { useDirection } from '../../../internal/provider/useDirection.js';
import type { ToastController } from './useToastController.js';
import { toastActions, toastText, type ToastEntry } from './toastEntry.js';
import type { ToastAction, ToastPlacement } from '../toastTypes.js';
import { usePortalContainer } from '../../../internal/popup/PortalContainerContext.js';
import { useModalOpen } from '../../../internal/dialog/useModalPresence.js';
import { Button, IconButton } from '../../../actions/Button.js';
import { IconClose } from '../../../icons/Close.js';
import { flag } from '../../../internal/flag.js';
import { ToastBody } from './ToastBody.js';
import { useToastGlide } from './useToastGlide.js';
import type { PictureNotice } from './PictureNotice.js';
import { optionModule, useOptionModule } from '../../../internal/react/useOptionModule.js';
import { useRenderedText } from '../../../internal/text/useRenderedText.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

type ToastObject = BaseToast.Root.ToastObject<ToastEntry>;

const pictureNoticeLoadedByContainedRegions = optionModule(() => import('./PictureNotice.js'));

const announcedByStatusAndAlertsInstead = 'off';
const dangerInterruptsAsAlert = { role: 'alert', 'aria-modal': undefined } as const;
const statusTheAnnouncerReads = {
  role: 'status',
  'aria-live': announcedByStatusAndAlertsInstead,
  'aria-modal': undefined,
} as const;

function entrySetByController(toast: ToastObject) {
  return toast.data!;
}

function ActionButtons({
  entry,
  button,
}: {
  entry: ToastEntry;
  button: (action: ToastAction, main: boolean) => ReactNode;
}) {
  const actions = toastActions(entry);
  if (actions.length === 0) return null;
  if (actions.length === 1) return button(actions[0], true);
  return (
    <span className="env-toast-actions">
      {actions.map((action, index) => (
        <Fragment key={index}>{button(action, index === actions.length - 1)}</Fragment>
      ))}
    </span>
  );
}

function linkAction(action: ToastAction & { href: string }, main: boolean) {
  return (
    <Button
      variant={main ? 'outline' : 'ghost'}
      className="env-toast-action"
      href={action.href}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );
}

function idsWaitingBehindHiddenCount(toasts: readonly ToastObject[], limit: number) {
  const activeNewestFirst = toasts.filter((toast) => toast.transitionStatus !== 'ending');
  const dangersTakeTheirPlacesFirst = activeNewestFirst.filter(
    (toast) => toast.data?.tone === 'danger',
  ).length;
  let room = Math.max(limit - dangersTakeTheirPlacesFirst, 0);
  const limited = new Set<string>();
  for (const toast of activeNewestFirst) {
    if (toast.data?.tone === 'danger') continue;
    if (room > 0) room -= 1;
    else limited.add(toast.id);
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
    ? new Set(toasts.map((toast) => toast.id))
    : idsWaitingBehindHiddenCount(toasts, visibleLimit);
  useLayoutEffect(() => {
    const visibleIds = new Set(
      toasts
        .filter((toast) => !limited.has(toast.id) && toast.transitionStatus !== 'ending')
        .map((toast) => toast.id),
    );
    controller.setVisibleNotifications(placement, visibleIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, placement, toasts, visibleLimit, held]);
  const [shownOutsideModal, setShownOutsideModal] = useState<ReadonlySet<string>>(() => new Set());
  useLayoutEffect(() => {
    if (held || toasts.every((toast) => shownOutsideModal.has(toast.id))) return;
    setShownOutsideModal(new Set(toasts.map((toast) => toast.id)));
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
  const [leftPictureNotices, setLeftPictureNotices] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const leave = useCallback(
    (id: string) => setLeftPictureNotices((current) => new Set(current).add(id)),
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
  const pictureNotice = useOptionModule(
    pictureNoticeLoadedByContainedRegions,
    contained,
  )?.PictureNotice;
  const regionLabel =
    placement === 'bottom-end' ? messages.regionBottomEnd : messages.regionTopCenter;
  const politelyAnnounced = toastStore.toasts.filter(
    (toast) =>
      toast.data?.tone !== 'danger' &&
      toast.transitionStatus !== 'ending' &&
      (!held || shownOutsideModal.has(toast.id)),
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
              <Badge
                className="env-toast-queued-count"
                data-toast-id="queued"
                count={`+${hiddenCount}`}
                aria-label={hiddenLabel}
              />
            )}
            {pictureNotice &&
              toastStore.toasts
                .filter((toast) => !leftPictureNotices.has(toast.id))
                .map((toast) => (
                  <PictureToast
                    key={toast.id}
                    LoadedPictureNotice={pictureNotice}
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
        <div className="env-toast-announcer" role="status" aria-live="polite" aria-atomic="false">
          {politelyAnnounced.map((toast) => (
            <div key={toast.id}>
              {toastText(entrySetByController(toast)) ?? entrySetByController(toast).message}
            </div>
          ))}
        </div>
      </Theme>
    </BaseToast.Portal>
  );
}

function PictureToast({
  LoadedPictureNotice,
  toast,
  limited,
  controller,
  dismissLabel,
  onClose,
  onGone,
}: {
  LoadedPictureNotice: typeof PictureNotice;
  toast: ToastObject;
  limited: boolean;
  controller: ToastController;
  dismissLabel: string;
  onClose: (id: string) => void;
  onGone: (id: string) => void;
}) {
  const entry = entrySetByController(toast);
  return (
    <LoadedPictureNotice
      id={toast.id}
      tone={entry.tone}
      limited={limited}
      ending={toast.transitionStatus === 'ending'}
      controller={controller}
      onGone={onGone}
    >
      <ToastBody
        tone={entry.tone}
        icon={entry.icon}
        message={<div className="env-toast-message">{entry.message}</div>}
        action={
          <ActionButtons
            entry={entry}
            button={(action, main) =>
              action.href !== undefined ? (
                linkAction({ ...action, href: action.href }, main)
              ) : (
                <Button
                  variant={main ? 'outline' : 'ghost'}
                  className="env-toast-action"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )
            }
          />
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
    </LoadedPictureNotice>
  );
}

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
  const entry = entrySetByController(toast);
  const danger = entry.tone === 'danger';
  const messageElement = useRef<HTMLDivElement>(null);
  const text = toastText(entry);
  const renderedText = useRenderedText(messageElement, text === undefined);
  return (
    <BaseToast.Root
      toast={toast}
      data-toast-id={toast.id}
      className="env-toast"
      data-tone={entry.tone}
      swipeDirection={swipeDirection}
      data-limited={flag(limited)}
      inert={limited || undefined}
      {...(danger ? dangerInterruptsAsAlert : statusTheAnnouncerReads)}
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
        icon={entry.icon}
        message={
          <BaseToast.Title
            ref={messageElement}
            className="env-toast-message"
            title={text ?? renderedText}
            render={<div />}
          />
        }
        action={
          <ActionButtons
            entry={entry}
            button={(action, main) =>
              action.href !== undefined ? (
                linkAction({ ...action, href: action.href }, main)
              ) : (
                <BaseToast.Action
                  render={
                    <Button
                      variant={main ? 'outline' : 'ghost'}
                      className="env-toast-action"
                      onClick={action.onClick}
                    />
                  }
                >
                  {action.label}
                </BaseToast.Action>
              )
            }
          />
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
