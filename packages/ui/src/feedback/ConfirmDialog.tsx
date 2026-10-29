'use client';

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button } from '../actions/Button.js';
import { useTheme } from '../foundations/Theme.js';
import { confirmDialog } from '../foundations/messages/confirmDialog.js';
import { classNames } from '../internal/classNames.js';
import { markTriggerOwner } from '../internal/triggerOwner.js';
import { ResetControlDefaults } from '../internal/ControlDefaults.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { keepsOpen, usePortalContainer } from '../internal/PortalContainerContext.js';
import { Alert } from './Alert.js';
import { DialogClose, type DialogOpenChangeDetails } from './Dialog.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogSurface,
  OverlayTheme,
} from './internal/DialogParts.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import '../styles/Base.css';
import '../styles/Dialog.css';

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
  /**
   * More content between the heading and the actions, such as what else the action affects, or the
   * one field a confirmation holds, such as a typed name. The dialog is a form: Enter in a field
   * confirms as the confirm button does, through onConfirm. Hold no form here; use Dialog for one.
   */
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
   * Runs the action when the confirm button is pressed, or Enter is pressed in a field in the
   * dialog. The dialog closes when it returns, or,
   * when it returns a promise, once the promise resolves; while it runs, the confirm button is
   * pending and nothing dismisses the dialog. It runs once per opening: further presses, such as
   * the second click of a double-click, are ignored until it fails or the dialog opens again. A
   * rejected promise or a thrown error keeps it open and is passed to reportError, so show what
   * went wrong with error.
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

/** Reports a failed action the way an uncaught error would be, without stopping the dialog. */
const report = (failure: unknown) => {
  if (typeof globalThis.reportError === 'function') globalThis.reportError(failure);
};

/**
 * Says while developing that the children hold a form of their own, which would nest in the
 * dialog's form: HTML has no nested forms, so its fields would submit the dialog's. Once a page.
 */
function reportNestedForm(form: HTMLFormElement | null) {
  reportInDevelopment(
    () =>
      process.env.NODE_ENV !== 'production' &&
      form?.querySelector('form') != null &&
      "a ConfirmDialog's children hold a <form>, which nests inside the dialog's own form. " +
        'ConfirmDialog confirms one action, with at most one field; use Dialog for a form of your own.',
  );
}

/** The root of a ConfirmDialog in a contained PortalContainer: not modal, closed by its buttons. */
function ContainedRoot(props: BaseAlertDialog.Root.Props) {
  return <BaseDialog.Root {...props} modal={false} disablePointerDismissal />;
}

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
  const portal = usePortalContainer();
  // An alert dialog is always modal; a contained one is a dialog that isn't, with the alert
  // dialog's role, and a press outside still doesn't close it.
  const Root = portal.contained ? ContainedRoot : BaseAlertDialog.Root;
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = open ?? ownOpen;
  const [pending, setPending] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const change = (next: boolean, details: DialogOpenChangeDetails) => {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next, details);
  };
  // Set before onConfirm runs, so a second press in the same tick or during the closing animation
  // doesn't run the action again; cleared when it fails, when the dialog opens again, and when it
  // succeeds but the application keeps a controlled dialog open.
  const running = useRef(false);
  useEffect(() => {
    if (isOpen) running.current = false;
  }, [isOpen]);
  const [confirmed, setConfirmed] = useState(0);
  useEffect(() => {
    if (confirmed > 0 && isOpen) running.current = false;
    // Only after a confirmation: the render it closed the dialog in, or that kept it open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed]);
  const run = async () => {
    if (!isOpen || running.current) return;
    running.current = true;
    let result: void | Promise<void>;
    try {
      result = onConfirm();
    } catch (failure) {
      running.current = false;
      report(failure);
      return;
    }
    if (isThenable(result)) {
      setPending(true);
      try {
        await result;
      } catch (failure) {
        // A failed action keeps the dialog open; the application shows why with error.
        running.current = false;
        report(failure);
        return;
      } finally {
        setPending(false);
      }
    }
    change(false, { reason: 'imperative-action' });
    setConfirmed((count) => count + 1);
  };
  return (
    <Root
      open={isOpen}
      onOpenChange={(next, eventDetails) => {
        if ((!next && pending) || keepsOpen(portal, next, eventDetails)) {
          eventDetails.cancel();
          return;
        }
        change(next, {
          reason: eventDetails.reason as DialogOpenChangeDetails['reason'],
        });
      }}
    >
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal container={portal.container}>
        <OverlayTheme {...theme}>
          <ResetControlDefaults>
            <DialogBackdrop />
            <div className="env-dialog-positioner" data-placement="center">
              <BaseAlertDialog.Popup
                render={<DialogSurface radius="xl" />}
                {...popupProps}
                className={classNames('env-dialog', className)}
                data-placement="center"
                data-width="md"
                data-tone={tone}
                aria-busy={pending || undefined}
                role="alertdialog"
                initialFocus={portal.contained ? false : tone === 'danger' ? cancel : confirm}
                finalFocus={portal.contained ? false : finalFocus}
              >
                <DialogContent>
                  <DialogHeader title={title} description={description} />
                  {/* A form, so Enter in a field in children confirms through the same run as the
                      confirm button, its submit button: pending, guarded and kept open on failure.
                      It lays out as if it weren't there. */}
                  <form
                    ref={reportNestedForm}
                    className="env-confirm-dialog-form"
                    noValidate
                    onSubmit={(event) => {
                      event.preventDefault();
                      // The dialog is portalled, but React events still bubble to a form around it.
                      event.stopPropagation();
                      void run();
                    }}
                  >
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
                        type="submit"
                      >
                        {confirmLabel}
                      </Button>
                    </DialogActions>
                  </form>
                </DialogContent>
              </BaseAlertDialog.Popup>
            </div>
          </ResetControlDefaults>
        </OverlayTheme>
      </BaseAlertDialog.Portal>
    </Root>
  );
}

markTriggerOwner(ConfirmDialog);
