'use client';

import { forwardRef } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode, RefObject } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { classNames } from '../internal/classNames.js';
import { Button, IconButton } from '../actions/Button.js';
import type { ButtonProps } from '../actions/Button.js';
import { Close } from '../icons/Close.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { dialog } from '../foundations/messages/dialog.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Stack } from '../foundations/Layout.js';
import { Surface } from '../foundations/Surface.js';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Whether the dialog is open, for a dialog the application controls with onOpenChange. */
  open?: boolean;
  /**
   * Whether a dialog the application doesn't control is open on the first render.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the requested state when the dialog asks to open or close: from the trigger,
   * Escape, an outside press, the close button or a DialogClose. Not called for a dismissal that
   * pending blocks.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The element that opens the dialog, such as a Button. It reports the dialog it opens, and focus
   * returns to it on close. Omit it for a dialog the application opens with open.
   */
  trigger?: ReactElement;
  /** The dialog's heading and accessible name, such as “Delete project?”. */
  title: ReactNode;
  /**
   * Muted text under the title that describes the dialog to assistive technology too, such as what
   * its action changes.
   */
  description?: ReactNode;
  /** The content between the heading and the actions, such as text, fields or a list. */
  children?: ReactNode;
  /**
   * The dialog's own actions, after the built-in close button, with the primary action last. They
   * close the dialog only where they are DialogClose or set open to false.
   */
  actions?: ReactNode;
  /**
   * The label of the built-in close button that starts the actions, such as Cancel, or the name of
   * a right panel's close icon button.
   * @default 'Close'
   */
  closeLabel?: string;
  /**
   * center for a modal in the middle of the window; top for a modal near the top of the window for
   * search-like tasks, so results grow downward without moving the field; right for a full-height
   * panel at the right edge, with a close icon button beside its title instead of the close button
   * in the actions, which takes the whole width of a narrow window such as a phone's.
   */
  placement?: 'center' | 'top' | 'right';
  /**
   * standard, 28 rem wide and 24 rem for a right panel, or wide, 44 rem, for content-heavy dialogs
   * and panels such as tables, comparisons and longer forms. Both narrow to fit the window.
   */
  size?: 'standard' | 'wide';
  /**
   * true traps focus in the dialog over a backdrop, hides the page from assistive technology,
   * blocks presses on it and locks its scroll. false leaves the page usable beside the dialog, for
   * a side panel that inspects it; it then closes when focus or a press goes outside it, unless
   * disablePointerDismissal.
   */
  modal?: boolean;
  /**
   * Keep the dialog open on presses outside it, and a non-modal dialog also when focus moves
   * outside, such as an inspector beside the page it inspects. Escape and the close buttons still
   * close it.
   */
  disablePointerDismissal?: boolean;
  /**
   * The element to focus when the dialog opens. By default focus moves to the first focusable
   * element inside, such as the first field, or to the dialog itself when opened by touch.
   */
  initialFocus?: RefObject<HTMLElement | null>;
  /**
   * The element to focus when the dialog closes, such as the row that opened it. By default focus
   * returns to the trigger, or to the element that had focus when the dialog opened.
   */
  finalFocus?: RefObject<HTMLElement | null>;
  /**
   * Work started from the dialog is in progress. Escape, outside presses and the close buttons
   * cannot dismiss it until pending returns to false. The built-in close button is disabled and
   * the dialog reports busy; a DialogClose stays enabled and runs its onClick, so disable it too.
   * Set pending on the action that started the work as well.
   */
  pending?: boolean;
}
/** Button's props without href: DialogClose is always a button. */
export type DialogCloseProps = Extract<ButtonProps, { href?: undefined }>;

/**
 * A button inside a Dialog that closes it after its own onClick, for an action other than the
 * built-in close button, such as Don't save or Done. It takes Button's props and is secondary by
 * default.
 */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { variant = 'secondary', ...props },
  ref,
) {
  return (
    <BaseDialog.Close ref={ref} render={<Button {...({ ...props, variant } as ButtonProps)} />} />
  );
});

/**
 * A focused task over the page: a centered modal, a modal near the top of the window, or a
 * full-height side panel at the right edge, modal or beside the page. It has a title, an optional
 * description, content and actions that start with a built-in close button. Base UI's dialog owns
 * focus, Escape and outside presses.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    actions,
    closeLabel: ownCloseLabel,
    placement = 'center',
    size = 'standard',
    modal = true,
    disablePointerDismissal = false,
    initialFocus,
    finalFocus,
    pending = false,
    className,
    ...popupProps
  },
  ref,
) {
  const theme = useTheme();
  const messages = useMessages('dialog', dialog);
  const closeLabel = ownCloseLabel ?? messages.close;
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, eventDetails) => {
        if (!next && pending) {
          eventDetails.cancel();
          return;
        }
        onOpenChange?.(next);
      }}
      modal={modal}
      disablePointerDismissal={disablePointerDismissal}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <Theme {...theme}>
          {modal && <BaseDialog.Backdrop className="env-dialog-backdrop" />}
          <div className="env-dialog-positioner" data-placement={placement}>
            <BaseDialog.Popup
              render={
                <Surface
                  background="default"
                  padding={5}
                  radius={placement === 'right' ? 'none' : 'xl'}
                />
              }
              {...popupProps}
              ref={ref}
              className={classNames('env-modal-pane', className)}
              data-placement={placement}
              data-size={size}
              aria-busy={pending || undefined}
              initialFocus={initialFocus}
              finalFocus={finalFocus}
            >
              <Stack gap={5} className="env-dialog-content">
                <div className="env-dialog-header">
                  <div className="env-dialog-heading">
                    <BaseDialog.Title className="env-dialog-title">{title}</BaseDialog.Title>
                    {placement === 'right' && (
                      <BaseDialog.Close
                        render={
                          <IconButton icon={<Close />} aria-label={closeLabel} disabled={pending} />
                        }
                      />
                    )}
                  </div>
                  {description != null && (
                    <BaseDialog.Description className="env-dialog-description">
                      {description}
                    </BaseDialog.Description>
                  )}
                </div>
                {children}
                {(placement !== 'right' || actions != null) && (
                  <Stack
                    direction="row"
                    wrap
                    align="center"
                    justify="end"
                    className="env-dialog-actions"
                  >
                    {placement !== 'right' && (
                      <DialogClose disabled={pending}>{closeLabel}</DialogClose>
                    )}
                    {actions}
                  </Stack>
                )}
              </Stack>
            </BaseDialog.Popup>
          </div>
        </Theme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
});
