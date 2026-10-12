import { useLayoutEffect, useRef } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button } from '../../actions/Button.js';
import { InfoChip } from '../../content/InfoChip.js';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { Close } from '../../icons/Close.js';
import { ToastBody } from './ToastBody.js';
import type { ToastController } from './useToastController.js';
import type { ToastEntry } from './ToastInternals.js';
import type { ToastPlacement } from './ToastTypes.js';

const glideId = 'env-toast-glide';

/** The vertical offset a running glide currently adds to a notice. */
function glideOffset(item: HTMLElement) {
  const [, y = '0'] = getComputedStyle(item).translate.split(' ');
  return Number.parseFloat(y) || 0;
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
  const viewport = useRef<HTMLDivElement>(null);
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
  // When notices arrive or leave, the others glide from their previous position instead of jumping.
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const glide = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const next = new Map<string, number>();
    // Layout positions on the page: the viewport grows from its anchored edge, so offsets within
    // it are not enough. offsetTop ignores transforms, entrance motion and running glides alike.
    const origin = element.getBoundingClientRect().top;
    for (const item of element.querySelectorAll<HTMLElement>(':scope > [data-toast-id]')) {
      const id = item.dataset.toastId!;
      const top = origin + item.offsetTop;
      const offset = glideOffset(item);
      const previous = positions.current.get(id);
      next.set(id, top);
      if (!glide || previous === undefined || Math.abs(previous - top) < 1) continue;
      // Start where the notice was drawn before this change, including an interrupted glide.
      for (const animation of item.getAnimations())
        if (animation.id === glideId) animation.cancel();
      item.animate([{ translate: `0 ${previous + offset - top}px` }, { translate: '0 0' }], {
        id: glideId,
        duration: 240,
        easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      });
    }
    positions.current = next;
  }, [toastStore.toasts, hiddenCount]);
  return (
    <BaseToast.Portal>
      <Theme theme={theme} className="env-toast-portal-theme">
        <BaseToast.Viewport
          ref={viewport}
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
            <InfoChip
              className="env-toast-queued-count"
              data-toast-id="queued"
              role="status"
              aria-label={`${hiddenCount} older notification${hiddenCount === 1 ? '' : 's'} hidden`}
            >
              +{hiddenCount}
            </InfoChip>
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
                        <span className="env-symbol">
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
