'use client';

import { useRef } from 'react';
import { Toast as BaseToast } from '@base-ui/react/toast';
import { flag } from '../../../internal/flag.js';
import type { ToastController } from './useToastController.js';
import { entrySetByController, toastText, type ToastObject } from './toastEntry.js';
import { ToastActionButtons, ToastDismissButton } from './ToastButtons.js';
import { ToastBody } from './ToastBody.js';
import { useRenderedText } from '../../../internal/text/useRenderedText.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

export const announcedByStatusAndAlertsInstead = 'off';
const dangerInterruptsAsAlert = { role: 'alert', 'aria-modal': undefined } as const;
const statusTheAnnouncerReads = {
  role: 'status',
  'aria-live': announcedByStatusAndAlertsInstead,
  'aria-modal': undefined,
} as const;

export function LiveToast({
  toastObject,
  limited,
  swipeDirection,
  controller,
  dismissLabel,
}: {
  toastObject: ToastObject;
  limited: boolean;
  swipeDirection: ('down' | 'left' | 'right')[];
  controller: ToastController;
  dismissLabel: string;
}) {
  const entry = entrySetByController(toastObject);
  const danger = entry.tone === 'danger';
  const messageElement = useRef<HTMLDivElement>(null);
  const text = toastText(entry);
  const renderedText = useRenderedText(messageElement, text === undefined);
  return (
    <BaseToast.Root
      toast={toastObject}
      data-toast-id={toastObject.id}
      className="env-toast"
      data-tone={entry.tone}
      swipeDirection={swipeDirection}
      data-limited={flag(limited)}
      inert={limited || undefined}
      {...(danger ? dangerInterruptsAsAlert : statusTheAnnouncerReads)}
      onMouseEnter={() => controller.pause(toastObject.id, 'hover')}
      onMouseLeave={() => controller.resume(toastObject.id, 'hover')}
      onFocusCapture={(event) => {
        if (event.target instanceof Element && event.target.matches(':focus-visible'))
          controller.pause(toastObject.id, 'focus');
        else controller.resume(toastObject.id, 'focus');
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          controller.resume(toastObject.id, 'focus');
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
        action={<ToastActionButtons entry={entry} live />}
        dismiss={
          entry.dismissible !== false && (
            <ToastDismissButton label={dismissLabel} onDismiss="closes-base-ui-toast" />
          )
        }
      />
    </BaseToast.Root>
  );
}
