import { forwardRef } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode, RefObject } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { classNames } from '../internal/classNames.js';
import { Button, IconButton } from '../actions/Button.js';
import type { ButtonProps } from '../actions/Button.js';
import { Close } from '../icons/Close.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Stack, ActionGroup } from '../foundations/Layout.js';
import { Surface } from '../foundations/Surface.js';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  closeLabel?: string;
  /** Centered modal or a full-height panel at the right edge. */
  placement?: 'center' | 'right';
  /** Non-modal panels allow interaction with the surrounding page. */
  modal?: boolean;
  /** Keep a non-modal inspector open while interacting with its source content. */
  disablePointerDismissal?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  finalFocus?: RefObject<HTMLElement | null>;
  /**
   * Work started from the dialog is in progress. Escape, outside presses and the built-in close
   * button cannot dismiss it until pending returns to false.
   */
  pending?: boolean;
}
export type DialogCloseProps = Extract<ButtonProps, { href?: undefined }>;

/** Use within Dialog when additional actions should dismiss it. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { variant = 'secondary', ...props },
  ref,
) {
  return <BaseDialog.Close ref={ref} render={<Button {...props} variant={variant} />} />;
});

/** Dialog and inspector shell; Base UI owns dismissal and modal-aware focus behavior. */
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
    closeLabel = 'Close',
    placement = 'center',
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
        <Theme theme={theme}>
          {modal && <BaseDialog.Backdrop className="env-dialog-backdrop" />}
          <div className="env-dialog-positioner" data-placement={placement}>
            <BaseDialog.Popup
              render={
                <Surface
                  tone="pane"
                  padding={5}
                  corners={placement === 'right' ? 'none' : 'surface'}
                />
              }
              {...popupProps}
              ref={ref}
              className={classNames('env-modal-pane', className)}
              data-placement={placement}
              aria-busy={pending || undefined}
              initialFocus={initialFocus}
              finalFocus={finalFocus}
            >
              <Stack gap={5} className="env-dialog-content">
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
                {children}
                {(placement === 'center' || actions != null) && (
                  <ActionGroup align="end" className="env-dialog-actions">
                    {placement === 'center' && (
                      <DialogClose disabled={pending}>{closeLabel}</DialogClose>
                    )}
                    {actions}
                  </ActionGroup>
                )}
              </Stack>
            </BaseDialog.Popup>
          </div>
        </Theme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
});
