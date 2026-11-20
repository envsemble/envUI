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
  type SyntheticEvent,
} from 'react';
import { Button } from '../actions/Button.js';
import { useTheme } from '../foundations/Theme.js';
import { confirmDialog } from '../foundations/messages/confirmDialog.js';
import { classNames } from '../internal/classNames.js';
import { markTriggerOwner } from '../internal/trigger/triggerOwner.js';
import { ResetControlDefaults } from '../internal/control/ControlDefaults.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { usePortalContainer } from '../internal/provider/PortalContainerContext.js';
import { containedOpenChange } from '../internal/popup/containedOverlays.js';
import { Alert } from '../feedback/Alert.js';
import { DialogClose, type DialogFocusTarget, type DialogOpenChangeDetails } from './Dialog.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogSurface,
  OverlayTheme,
} from '../internal/dialog/DialogParts.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import '../styles/Base.css';
import '../styles/Dialog.css';

export interface ConfirmDialogProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title' | 'children' | 'onError'
> {
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
  /**
   * The confirm button's label: a verb that names the consequence, such as Delete project. Like a
   * Button's content, it can hold more, such as a Kbd of its shortcut.
   */
  confirmLabel: ReactNode;
  /**
   * The cancel button's label.
   * @default 'Cancel', or EnvUIProvider's messages.confirmDialog.cancel
   */
  cancelLabel?: ReactNode;
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
  /**
   * Whether the confirm button is disabled, and Enter in a field doesn't confirm, such as for a
   * confirmation that waits on a typed name.
   * @default false
   */
  confirmDisabled?: boolean;
  /** What went wrong, shown as a danger Alert above the actions and announced. */
  error?: ReactNode;
  /**
   * The element to focus when the dialog closes, such as the menu button whose item opened it: its
   * ref, or a function of how the dialog was opened that returns it, as on Dialog. By default focus
   * returns to the trigger, or to the element that had focus when it opened.
   */
  finalFocus?: DialogFocusTarget;
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';

const reportAsUncaught = (failure: unknown) => {
  if (typeof globalThis.reportError === 'function') globalThis.reportError(failure);
};

const keepFromBubblingPastPortal = (event: SyntheticEvent) => event.stopPropagation();

function reportNestedForm(form: HTMLFormElement | null) {
  reportInDevelopment(
    () =>
      process.env.NODE_ENV !== 'production' &&
      form?.querySelector('form') != null &&
      "a ConfirmDialog's children hold a <form>, which nests inside the dialog's own form. " +
        'ConfirmDialog confirms one action, with at most one field; use Dialog for a form of your own.',
  );
}

function ContainedNonModalRoot(props: BaseAlertDialog.Root.Props) {
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
  confirmDisabled = false,
  error,
  finalFocus,
  className,
  ...popupProps
}: ConfirmDialogProps) {
  const theme = useTheme();
  const messages = useMessages('confirmDialog', confirmDialog);
  const portal = usePortalContainer();
  const Root = portal.contained ? ContainedNonModalRoot : BaseAlertDialog.Root;
  const [isOpen, change] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [pending, setPending] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const confirmationRunning = useRef(false);
  useEffect(
    function allowConfirmingOnceReopened() {
      if (isOpen) confirmationRunning.current = false;
    },
    [isOpen],
  );
  const [confirmed, setConfirmed] = useState(0);
  useEffect(
    function allowConfirmingAgainWhenKeptOpen() {
      if (confirmed > 0 && isOpen) confirmationRunning.current = false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirmed],
  );
  const confirmOnce = async () => {
    if (!isOpen || confirmationRunning.current) return;
    confirmationRunning.current = true;
    let result: void | Promise<void>;
    try {
      result = onConfirm();
    } catch (failure) {
      confirmationRunning.current = false;
      reportAsUncaught(failure);
      return;
    }
    if (isThenable(result)) {
      setPending(true);
      try {
        await result;
      } catch (failure) {
        confirmationRunning.current = false;
        reportAsUncaught(failure);
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
      onOpenChange={containedOpenChange(portal, null, (next, eventDetails) => {
        if (!next && pending) eventDetails.cancel();
        else change(next, { reason: eventDetails.reason });
      })}
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
                  <form
                    ref={reportNestedForm}
                    className="env-confirm-dialog-form"
                    noValidate
                    onSubmit={(event) => {
                      event.preventDefault();
                      keepFromBubblingPastPortal(event);
                      if (!confirmDisabled) void confirmOnce();
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
                        disabled={confirmDisabled}
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
