import { useEffect, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Button, type ButtonAppearanceProps } from './Button.js';
import { classNames } from '../internal/classNames.js';

export interface ConfirmButtonProps
  extends Omit<ButtonAppearanceProps, 'variant'>,
    Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'type'> {
  /** The resting appearance; armed, the button is always destructive. outlined by default. */
  variant?: 'outlined' | 'secondary' | 'destructive' | 'text';
  /** The label while armed, naming what a second press does, such as “Remove Morgan?”. */
  confirmLabel: ReactNode;
  /** Runs on the second press, while the button is armed. */
  onConfirm: () => void;
  /** How long the button stays armed without a second press, in milliseconds. */
  armedDuration?: number;
}

/**
 * A button for an action that takes effect at once and cannot be undone. The first press arms it and
 * names the consequence in place; a second press runs it. It disarms after a few seconds, when focus
 * leaves and on Escape.
 */
export function ConfirmButton({
  variant = 'outlined',
  confirmLabel,
  onConfirm,
  armedDuration = 4000,
  children,
  disabled,
  pending,
  className,
  onBlur,
  onKeyDown,
  'aria-label': label,
  ...props
}: ConfirmButtonProps) {
  const [armedAt, setArmedAt] = useState<number | null>(null);
  // Disabling the button or starting its work ends an earlier arming.
  if ((disabled || pending) && armedAt !== null) setArmedAt(null);
  const armed = armedAt !== null && !disabled && !pending;
  useEffect(() => {
    if (!armed) return;
    const disarmTimer = setTimeout(() => setArmedAt(null), armedDuration);
    return () => clearTimeout(disarmTimer);
  }, [armed, armedDuration]);
  return (
    <>
      <Button
        {...props}
        // Armed, the visible confirm label names the button.
        aria-label={armed ? undefined : label}
        variant={armed ? 'destructive' : variant}
        disabled={disabled}
        pending={pending}
        className={classNames('env-confirm-button', className)}
        data-armed={armed ? '' : undefined}
        onClick={(event) => {
          if (armedAt === null) {
            setArmedAt(event.timeStamp);
            return;
          }
          // A double click arms the button only: the second press must be deliberate.
          if (event.timeStamp - armedAt < DOUBLE_PRESS_GUARD_MS) return;
          setArmedAt(null);
          onConfirm();
        }}
        onBlur={(event) => {
          setArmedAt(null);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && armed) {
            event.stopPropagation();
            setArmedAt(null);
          }
          onKeyDown?.(event);
        }}
      >
        {armed ? confirmLabel : children}
      </Button>
      {/* A label change on a focused button is not reliably announced, so the armed state is. */}
      <span className="env-confirm-button-status" role="status">
        {armed && <>{confirmLabel} Press again to confirm.</>}
      </span>
    </>
  );
}

const DOUBLE_PRESS_GUARD_MS = 400;
