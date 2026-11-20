'use client';

import { useContext } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode, RefObject } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { classNames } from '../internal/classNames.js';
import { markTriggerOwner } from '../internal/trigger/triggerOwner.js';
import { Button, IconButton } from '../actions/Button.js';
import { IconClose } from '../icons/Close.js';
import type { ButtonProps, ButtonVariant } from '../actions/Button.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { dialog } from '../foundations/messages/dialog.js';
import { useTheme } from '../foundations/Theme.js';
import {
  DialogActions,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogPendingContext,
  DialogSurface,
  OverlayTheme,
} from '../internal/dialog/DialogParts.js';
import { withPendingAction } from './internal/DialogPendingAction.js';
import { ResetControlDefaults } from '../internal/control/ControlDefaults.js';
import { usePortalContainer } from '../internal/provider/PortalContainerContext.js';
import { containedModal, containedOpenChange } from '../internal/popup/containedOverlays.js';
import type { OverlayOpenChangeReason } from '../internal/popup/overlayOpenChangeReason.js';
import type { SkeletonProps } from '../internal/skeleton.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Dialog.css';

/**
 * Why a dialog or a sheet asks to open or close: its trigger, Escape, a press outside, focus
 * leaving a non-modal one, a close button, a swipe (sheets) or the application.
 */
export type DialogOpenChangeReason = Extract<
  OverlayOpenChangeReason,
  | 'trigger-press'
  | 'outside-press'
  | 'escape-key'
  | 'close-press'
  | 'focus-out'
  | 'close-watcher'
  | 'imperative-action'
  | 'swipe'
  | 'none'
>;

/** What onOpenChange receives beside the requested state. */
export interface DialogOpenChangeDetails {
  /** Why the dialog asks to open or close. */
  reason: DialogOpenChangeReason;
}

/** Where focus goes as a dialog opens or closes: an element's ref, or a function of how it was opened. */
export type DialogFocusTarget =
  | boolean
  | RefObject<HTMLElement | null>
  | ((
      interaction: 'mouse' | 'touch' | 'pen' | 'keyboard' | '',
    ) => HTMLElement | boolean | void | null);

export interface DialogProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>, SkeletonProps {
  /** Whether the dialog is open, for a dialog the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether a dialog the application doesn't control is open on the first render.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the requested state, and why, when the dialog asks to open or close: from the
   * trigger, Escape, an outside press, the close button or a DialogClose. Not called for a
   * dismissal that pending blocks.
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /**
   * The element that opens the dialog, such as a Button. It reports the dialog it opens, and focus
   * returns to it on close. Omit it for a dialog the application opens with open.
   */
  trigger?: ReactElement;
  /**
   * The dialog's heading and accessible name, such as “Delete project?”. Without one, such as for
   * an image viewer or a search dialog its field names, name the dialog with aria-label or
   * aria-labelledby.
   */
  title?: ReactNode;
  /**
   * Muted text under the title that describes the dialog to assistive technology too, such as what
   * its action changes.
   */
  description?: ReactNode;
  /** The content between the heading and the actions, such as text, fields or a list. */
  children?: ReactNode;
  /**
   * The dialog's own actions, after the built-in close button, with the primary action last. They
   * close the dialog only where they are DialogClose or set open to false. While the dialog is
   * pending, the last one shows it, where it is a Button that sets no pending of its own; another
   * component reads it with useDialogPending.
   */
  actions?: ReactNode;
  /**
   * Content at the start of the actions' row, which takes the room the actions leave, such as a
   * destructive Delete, a Learn more link or a Don't show again checkbox.
   */
  actionsStart?: ReactNode;
  /**
   * Whether the dialog shows its built-in close button, as on a Sheet. Leave it out only where the
   * dialog places its own DialogClose.
   * @default true
   */
  closeButton?: boolean;
  /**
   * Where the built-in close button is: actions, a secondary button that starts the actions;
   * heading, an IconButton with a cross at the end of the heading, as on a Sheet.
   * @default 'actions'
   */
  closeButtonPlacement?: 'actions' | 'heading';
  /**
   * The label of the built-in close button, such as Cancel, or its name in the heading.
   * @default 'Close', or EnvUIProvider's messages.dialog.close
   */
  closeLabel?: string;
  /** Content before the title in the heading's row, such as a back button. */
  headerStart?: ReactNode;
  /**
   * Content at the end of the heading's row, before a close button there, such as a Menu of more
   * actions or an Open full page button.
   */
  headerEnd?: ReactNode;
  /**
   * center for a modal in the middle of the window; top for a modal near the top of the window for
   * search-like tasks, so results grow downward without moving the field. For a panel at an edge
   * of the window, use Sheet.
   * @default 'center'
   */
  placement?: 'center' | 'top';
  /**
   * md, 28 rem wide, or lg, 44 rem, for content-heavy dialogs such as tables, comparisons and
   * longer forms. Both narrow to fit the window.
   * @default 'md'
   */
  width?: 'md' | 'lg';
  /**
   * true traps focus in the dialog over a backdrop, hides the page from assistive technology,
   * blocks presses on it and locks its scroll. false leaves the page usable beside the dialog; it
   * then closes when focus or a press goes outside it, unless disablePointerDismissal.
   * @default true
   */
  modal?: boolean;
  /**
   * Keep the dialog open on presses outside it, and a non-modal dialog also when focus moves
   * outside. Escape and the close buttons still close it.
   * @default false
   */
  disablePointerDismissal?: boolean;
  /**
   * The element to focus when the dialog opens, as a ref or a function of how it was opened. By
   * default focus moves to the first focusable element inside, such as the first field, or to the
   * dialog itself when opened by touch.
   */
  initialFocus?: DialogFocusTarget;
  /**
   * The element to focus when the dialog closes, such as the row that opened it. By default focus
   * returns to the trigger, or to the element that had focus when the dialog opened.
   */
  finalFocus?: DialogFocusTarget;
  /**
   * Work started from the dialog is in progress. Escape, outside presses and the close buttons
   * cannot dismiss it until pending returns to false: the built-in close button and every
   * DialogClose inside are disabled, the primary action, the last of actions, shows it pending, and
   * the dialog reports busy.
   * @default false
   */
  pending?: boolean;
}

/** Button's props without href: DialogClose is always a button. */
export type DialogCloseProps = {
  /**
   * The emphasis, as Button's; secondary by default, as an action beside the dialog's main one.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
} & Extract<ButtonProps, { href?: undefined }>;

/**
 * Whether the Dialog or Sheet around it is pending, for an action component of the application's
 * own, such as a Button wrapped for analytics, to show the work its press started.
 */
export function useDialogPending(): boolean {
  return useContext(DialogPendingContext);
}

/**
 * A button inside a Dialog or a Sheet that closes it after its own onClick, for an action other
 * than the built-in close button, such as Don't save or Done. It takes Button's props and is
 * secondary by default, and is disabled while the dialog or sheet is pending.
 */
export function DialogClose({ variant = 'secondary', ref, disabled, ...props }: DialogCloseProps) {
  const pending = useContext(DialogPendingContext);
  return (
    <BaseDialog.Close
      ref={ref}
      render={<Button {...({ ...props, variant, disabled: disabled || pending } as ButtonProps)} />}
    />
  );
}

/**
 * A focused task over the page: a centered modal, or a modal near the top of the window. It has a
 * title, an optional description, content and actions that start with a built-in close button.
 * Base UI's dialog owns focus, Escape and outside presses. className, style, ref and data
 * attributes go to the dialog's surface.
 */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  actions,
  actionsStart,
  closeButton = true,
  closeButtonPlacement = 'actions',
  closeLabel: ownCloseLabel,
  headerStart,
  headerEnd,
  placement = 'center',
  width = 'md',
  modal = true,
  disablePointerDismissal = false,
  initialFocus,
  finalFocus,
  pending = false,
  skeleton = false,
  className,
  ...popupProps
}: DialogProps) {
  const theme = useTheme();
  const messages = useMessages('dialog', dialog);
  const closeLabel = ownCloseLabel ?? messages.close;
  const closesInActions = closeButton && closeButtonPlacement === 'actions';
  const portal = usePortalContainer();
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={containedOpenChange(portal, null, (next, eventDetails) => {
        if (!next && pending) eventDetails.cancel();
        else onOpenChange?.(next, { reason: eventDetails.reason });
      })}
      modal={containedModal(portal, modal)}
      disablePointerDismissal={disablePointerDismissal}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal container={portal.container}>
        <OverlayTheme {...theme}>
          <ResetControlDefaults>
            {modal && <DialogBackdrop />}
            <div className="env-dialog-positioner" data-placement={placement}>
              <BaseDialog.Popup
                render={<DialogSurface radius="xl" />}
                {...popupProps}
                className={classNames('env-dialog', className)}
                data-placement={placement}
                data-width={width}
                aria-busy={pending || skeleton || undefined}
                data-env-skeleton={flag(skeleton)}
                initialFocus={portal.contained ? false : initialFocus}
                finalFocus={portal.contained ? false : finalFocus}
              >
                <DialogPendingContext.Provider value={pending}>
                  <DialogContent skeleton={skeleton}>
                    <DialogHeader
                      title={title}
                      description={description}
                      start={headerStart}
                      end={headerEnd}
                      close={
                        closeButton && closeButtonPlacement === 'heading' ? (
                          <BaseDialog.Close
                            render={
                              <IconButton
                                variant="ghost"
                                icon={<IconClose />}
                                aria-label={closeLabel}
                                disabled={pending}
                              />
                            }
                          />
                        ) : undefined
                      }
                    />
                    {children}
                    {(closesInActions || actions != null || actionsStart != null) && (
                      <DialogActions start={actionsStart}>
                        {closesInActions && <DialogClose>{closeLabel}</DialogClose>}
                        {withPendingAction(actions, pending)}
                      </DialogActions>
                    )}
                  </DialogContent>
                </DialogPendingContext.Provider>
              </BaseDialog.Popup>
            </div>
          </ResetControlDefaults>
        </OverlayTheme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

markTriggerOwner(Dialog);
