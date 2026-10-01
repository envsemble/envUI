import { forwardRef } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode, RefObject } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Button } from './Primitives.js';
import type { ButtonProps } from './Primitives.js';
import { Theme, useTheme } from './Theme.js';
import { Stack, ActionGroup } from './Layout.js';
import { Surface } from './Surface.js';

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
  initialFocus?: RefObject<HTMLElement | null>;
  finalFocus?: RefObject<HTMLElement | null>;
}
export type DialogCloseProps = Extract<ButtonProps, { href?: undefined }>;

/** Use within Dialog when additional actions should dismiss its modal. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { variant = 'secondary', ...props },
  ref,
) {
  return <BaseDialog.Close ref={ref} render={<Button {...props} variant={variant} />} />;
});

/** A modal shell; Base UI owns dismissal, trapped focus, and focus restoration. */
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
    initialFocus,
    finalFocus,
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
      onOpenChange={(next) => onOpenChange?.(next)}
      modal
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <Theme theme={theme}>
          <BaseDialog.Backdrop className="env-dialog-backdrop" />
          <div className="env-dialog-positioner">
            <BaseDialog.Popup
              render={<Surface tone="pane" padding={5} />}
              {...popupProps}
              ref={ref}
              className={['env-modal-pane', className].filter(Boolean).join(' ')}
              initialFocus={initialFocus}
              finalFocus={finalFocus}
            >
              <Stack gap={5} className="env-dialog-content">
                <BaseDialog.Title className="env-dialog-title">{title}</BaseDialog.Title>
                {description != null && (
                  <BaseDialog.Description className="env-dialog-description">
                    {description}
                  </BaseDialog.Description>
                )}
                {children}
                <ActionGroup align="end" className="env-dialog-actions">
                  <DialogClose>{closeLabel}</DialogClose>
                  {actions}
                </ActionGroup>
              </Stack>
            </BaseDialog.Popup>
          </div>
        </Theme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
});
