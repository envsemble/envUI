'use client';

import type { ToastController } from './useToastController.js';
import { entrySetByController, type ToastObject } from './toastEntry.js';
import { ToastActionButtons, ToastDismissButton } from './ToastButtons.js';
import { ToastBody } from './ToastBody.js';
import type { ContainedToastRoot } from './ContainedToastRoot.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

export function ContainedToast({
  LoadedRoot,
  toastObject,
  limited,
  controller,
  dismissLabel,
  onClose,
  onGone,
}: {
  LoadedRoot: typeof ContainedToastRoot;
  toastObject: ToastObject;
  limited: boolean;
  controller: ToastController;
  dismissLabel: string;
  onClose: (id: string) => void;
  onGone: (id: string) => void;
}) {
  const entry = entrySetByController(toastObject);
  return (
    <LoadedRoot
      id={toastObject.id}
      tone={entry.tone}
      limited={limited}
      ending={toastObject.transitionStatus === 'ending'}
      controller={controller}
      onGone={onGone}
    >
      <ToastBody
        tone={entry.tone}
        icon={entry.icon}
        message={<div className="env-toast-message">{entry.message}</div>}
        action={<ToastActionButtons entry={entry} live={false} />}
        dismiss={
          entry.dismissible !== false && (
            <ToastDismissButton label={dismissLabel} onDismiss={() => onClose(toastObject.id)} />
          )
        }
      />
    </LoadedRoot>
  );
}
