import { useLayoutEffect, useSyncExternalStore } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button } from '../../actions/Button.js';
import { InfoChip } from '../../content/InfoChip.js';
import { Theme, useTheme } from '../../foundations/Theme.js';
import { Close } from '../../icons/Close.js';
import { ToastBody } from './ToastBody.js';
import type { ToastController } from './useToastController.js';
import type { ToastEntry, ToastPlacement } from './ToastTypes.js';

export function ToastRegion({
  placement,
  controller,
}: {
  placement: ToastPlacement;
  controller: ToastController;
}) {
  const toastStore = BaseToast.useToastManager<ToastEntry>();
  const theme = useTheme();
  const queuedCount = useSyncExternalStore(
    controller.subscribeToQueue,
    () => controller.getQueuedCount(placement),
    () => 0,
  );
  useLayoutEffect(
    () =>
      controller.registerPlacementStore(placement, {
        add: toastStore.add,
        close: toastStore.close,
      }),
    [controller, placement, toastStore.add, toastStore.close],
  );
  return (
    <BaseToast.Portal>
      <Theme theme={theme} className="env-toast-portal-theme">
        <BaseToast.Viewport
          className={`env-toast-viewport env-toast-viewport-${placement}`}
          aria-label={
            placement === 'bottom-right' ? 'Bottom right notifications' : 'Top center notifications'
          }
          onFocusCapture={() => controller.setPlacementFocused(placement, true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              controller.setPlacementFocused(placement, false);
          }}
        >
          {queuedCount > 0 && (
            <InfoChip
              className="env-toast-queued-count"
              role="status"
              aria-label={`${queuedCount} more notification${queuedCount === 1 ? '' : 's'} queued`}
            >
              +{queuedCount}
            </InfoChip>
          )}
          {toastStore.toasts.map((toast) => {
            const entry = toast.data!;
            return (
              <BaseToast.Root
                key={toast.id}
                toast={toast}
                className={`env-toast env-toast-${entry.variant}`}
                onMouseEnter={() => controller.pause(toast.id, 'hover')}
                onMouseLeave={() => controller.resume(toast.id, 'hover')}
                onFocusCapture={() => controller.pause(toast.id, 'focus')}
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
