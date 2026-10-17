'use client';

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import {
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button } from '../actions/Button.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { confirmDialog } from '../foundations/messages/confirmDialog.js';
import { classNames } from '../internal/classNames.js';
import { ResetControlDefaults } from '../internal/ControlDefaults.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { Alert } from './Alert.js';
import { DialogClose, type DialogOpenChangeDetails } from './Dialog.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogSurface,
} from './internal/DialogParts.js';

export interface ConfirmDialogProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children' | 'onError'> {
  /** Whether the dialog is open, for a dialog the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether a dialog the application doesn't control is open on the first render.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the requested state, and why, when the dialog opens or closes: from the trigger,
   * Escape, Cancel, or after onConfirm finishes. Not called for a dismissal that a running
   * onConfirm blocks.
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /**
   * The element that opens the dialog, such as a Button. Omit it for a dialog the application
   * opens with open, such as from a menu item.
   */
  trigger?: ReactElement;
  /** The question, which names the dialog, such as “Delete Northwind launch?”. */
  title: ReactNode;
  /** What confirming does and whether it can be undone; it describes the dialog. */
  description?: ReactNode;
  /** More content between the heading and the actions, such as what else the action affects. */
  children?: ReactNode;
  /** The confirm button's label: a verb that names the consequence, such as Delete project. */
  confirmLabel: string;
  /**
   * The cancel button's label.
   * @default 'Cancel', or EnvUIProvider's messages.confirmDialog.cancel
   */
  cancelLabel?: string;
  /**
   * danger for an action that deletes or ends something: the confirm button is a danger one and
   * focus starts on Cancel, so a hurried Enter doesn't confirm. neutral starts focus on the confirm
   * button.
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /**
   * Runs the action when the confirm button is pressed. The dialog closes when it returns, or,
   * when it returns a promise, once the promise resolves; while it runs, the confirm button is
   * pending and nothing dismisses the dialog. A rejected promise or a thrown error keeps it open,
   * so show what went wrong with error.
   */
  onConfirm: () => void | Promise<void>;
  /** What went wrong, shown as a danger Alert above the actions and announced. */
  error?: ReactNode;
  /**
   * The element to focus when the dialog closes, such as the menu button whose item opened it. By
   * default focus returns to the trigger, or to the element that had focus when it opened.
   */
  finalFocus?: RefObject<HTMLElement | null>;
}

/** Whether a value is a promise or another thenable. */
const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';

/**
 * Asks people to confirm an action whose consequence needs a sentence, such as deleting a project:
 * an alert dialog with a question, a description, Cancel and a confirm button that names the
 * consequence. It waits for onConfirm's promise, pending, and stays open when it fails.
 * className, style, ref and data attributes go to the dialog's surface.
 */
export function ConfirmDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  tone = 'neutral',
  onConfirm,
  error,
  finalFocus,
  className,
  ...popupProps
}: ConfirmDialogProps) {
  const theme = useTheme();
  const messages = useMessages('confirmDialog', confirmDialog);
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [pending, setPending] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const change = (next: boolean, details: DialogOpenChangeDetails) => {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next, details);
  };
  const run = async () => {
    if (pending) return;
    let result: void | Promise<void>;
    try {
      result = onConfirm();
    } catch {
      return;
    }
    if (isThenable(result)) {
      setPending(true);
      try {
        await result;
      } catch {
        // A failed action keeps the dialog open; the application shows why with error.
        return;
      } finally {
        setPending(false);
      }
    }
    change(false, { reason: 'imperative-action' });
  };
  return (
    <BaseAlertDialog.Root
      open={isOpen}
      onOpenChange={(next, eventDetails) => {
        if (!next && pending) {
          eventDetails.cancel();
          return;
        }
        change(next, {
          reason: eventDetails.reason as DialogOpenChangeDetails['reason'],
        });
      }}
    >
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal>
        <Theme {...theme}>
          <ResetControlDefaults>
            <DialogBackdrop />
            <div className="env-dialog-positioner" data-placement="center">
              <BaseAlertDialog.Popup
                render={<DialogSurface radius="xl" />}
                {...popupProps}
                className={classNames('env-dialog-popup', className)}
                data-placement="center"
                data-width="md"
                data-tone={tone}
                aria-busy={pending || undefined}
                initialFocus={tone === 'danger' ? cancel : confirm}
                finalFocus={finalFocus}
              >
                <DialogContent>
                  <DialogHeader title={title} description={description} />
                  {children}
                  {error != null && (
                    <Alert tone="danger" announce>
                      {error}
                    </Alert>
                  )}
                  <DialogActions>
                    <DialogClose ref={cancel} disabled={pending}>
                      {cancelLabel ?? messages.cancel}
                    </DialogClose>
                    <Button
                      ref={confirm}
                      variant="primary"
                      tone={tone}
                      pending={pending}
                      onClick={run}
                    >
                      {confirmLabel}
                    </Button>
                  </DialogActions>
                </DialogContent>
              </BaseAlertDialog.Popup>
            </div>
          </ResetControlDefaults>
        </Theme>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}
