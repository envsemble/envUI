'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Toast as BaseToast } from '@base-ui/react/toast';
import { Button, IconButton } from '../../actions/Button.js';
import { IconClose } from '../../icons/Close.js';
import { flag } from '../../internal/flag.js';
import { ToastBody } from './ToastBody.js';
import type { ToastEntry } from './toastInternals.js';
import type { ToastController } from './useToastController.js';
import '../../styles/Base.css';
import '../../styles/Toast.css';

/**
 * A notice of a contained region's picture: it arrives and leaves with a live notice's motion, from
 * the toast's starting and ending styles, and its time stops while the pointer rests on it. It
 * keeps a live notice's look, action, dismiss button and duration. Once it has left, `onGone` takes
 * it out of the picture.
 */
export function PictureNotice({
  toast,
  limited,
  controller,
  dismissLabel,
  onDismiss,
  onGone,
}: {
  toast: BaseToast.Root.ToastObject<ToastEntry>;
  limited: boolean;
  controller: ToastController;
  dismissLabel: string;
  onDismiss: (id: string) => void;
  onGone: (id: string) => void;
}) {
  const { id } = toast;
  // Every notice the controller adds carries its entry.
  const entry = toast.data!;
  const ending = toast.transitionStatus === 'ending';
  const element = useRef<HTMLDivElement>(null);
  // A notice closed before it was ever shown, such as one an effect shows and takes back at once,
  // never arrives.
  const [arrives] = useState(!ending);
  // It comes in from its starting style, which its first style holds, as Base UI's notices do.
  useLayoutEffect(() => {
    const item = element.current;
    if (!item) return;
    void getComputedStyle(item).opacity;
    item.removeAttribute('data-starting-style');
  }, []);
  // Leaving, it fades to its ending style, and is gone once that ends; at once without motion.
  useEffect(() => {
    if (!ending) return;
    const item = element.current;
    const seconds = item
      ? Math.max(...getComputedStyle(item).transitionDuration.split(',').map(Number.parseFloat))
      : 0;
    const timer = setTimeout(() => onGone(id), (seconds || 0) * 1000);
    return () => clearTimeout(timer);
  }, [ending, id, onGone]);
  if (!arrives) return null;
  return (
    <div
      ref={element}
      data-toast-id={id}
      className="env-toast"
      data-tone={entry.tone}
      data-limited={flag(limited)}
      data-starting-style=""
      data-ending-style={ending ? '' : undefined}
      role={entry.tone === 'danger' ? 'alert' : 'status'}
      onMouseEnter={() => controller.pause(id, 'hover')}
      onMouseLeave={() => controller.resume(id, 'hover')}
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
              onClick={() => onDismiss(id)}
            />
          )
        }
      />
    </div>
  );
}
