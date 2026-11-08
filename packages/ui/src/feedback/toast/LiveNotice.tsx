'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { Button, IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import { flag } from '../../internal/flag.js';
import { ToastBody } from './ToastBody.js';
import type { ToastEntry } from './toastInternals.js';
import type { ToastController } from './useToastController.js';
import '../../styles/Base.css';
import '../../styles/Toast.css';

/**
 * A notice of the live region, Base UI's toast: swiped away, paused while the pointer rests on it
 * or focus is inside it, and out of reach while it waits behind the count of hidden ones.
 */
export function LiveNotice({
  toast,
  limited,
  swipeDirection,
  controller,
  dismissLabel,
}: {
  toast: BaseToast.Root.ToastObject<ToastEntry>;
  limited: boolean;
  swipeDirection: ('down' | 'left' | 'right')[];
  controller: ToastController;
  dismissLabel: string;
}) {
  // Every notice the controller adds carries its entry.
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
