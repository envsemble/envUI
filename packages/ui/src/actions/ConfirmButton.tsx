import {
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button, type ButtonAppearanceProps } from './Button.js';
import { classNames } from '../internal/classNames.js';

interface ConfirmButtonBaseProps
  extends Omit<ButtonAppearanceProps, 'variant'>,
    Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'type'> {
  /**
   * The resting appearance; armed, the button is always destructive. outlined by default, and
   * secondary for an icon-only button, like IconButton.
   */
  variant?: 'outlined' | 'secondary' | 'destructive' | 'text';
  /** The label while armed, naming what a second press does, such as “Remove Morgan?”. */
  confirmLabel: ReactNode;
  /** Runs on the second press, while the button is armed. */
  onConfirm: () => void;
  /** How long the button stays armed without a second press, in milliseconds. */
  armedDuration?: number;
}

export type ConfirmButtonProps = ConfirmButtonBaseProps &
  (
    | { icon?: undefined }
    | {
        /**
         * A round icon-only button at rest, named by aria-label. Armed, it shows the icon with the
         * confirm label, so the consequence is still named.
         */
        icon: ReactNode;
        'aria-label': string;
        children?: never;
      }
  );

/**
 * A button for an action that takes effect at once and cannot be undone. The first press arms it and
 * names the consequence in place; a second press runs it. It disarms after a few seconds, when focus
 * leaves and on Escape.
 */
export function ConfirmButton({
  icon,
  variant = icon == null ? 'outlined' : 'secondary',
  confirmLabel,
  onConfirm,
  armedDuration = 4000,
  children,
  disabled,
  pending,
  startIcon,
  endIcon,
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
  const shared = {
    ...props,
    variant: armed ? ('destructive' as const) : variant,
    disabled,
    pending,
    className: classNames('env-confirm-button', className),
    'data-armed': armed ? '' : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (armedAt === null) {
        setArmedAt(event.timeStamp);
        return;
      }
      // A double click arms the button only: the second press must be deliberate.
      if (event.timeStamp - armedAt < DOUBLE_PRESS_GUARD_MS) return;
      setArmedAt(null);
      onConfirm();
    },
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      setArmedAt(null);
      onBlur?.(event);
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && armed) {
        event.stopPropagation();
        setArmedAt(null);
      }
      onKeyDown?.(event);
    },
  };
  return (
    <>
      {/* At rest an icon-only button is round and named by its label; armed, it grows to name the
          consequence beside its icon. Both are the same button, so focus stays on it. */}
      {icon != null && !armed ? (
        <Button {...shared} iconOnly icon={icon} aria-label={label ?? ''} />
      ) : (
        <Button
          {...shared}
          startIcon={armed && icon != null ? icon : startIcon}
          endIcon={endIcon}
          // Armed, the visible confirm label names the button.
          aria-label={armed ? undefined : label}
        >
          {armed ? confirmLabel : children}
        </Button>
      )}
      {/* A label change on a focused button is not reliably announced, so the armed state is. */}
      <span className="env-confirm-button-status" role="status">
        {armed && <>{confirmLabel} Press again to confirm.</>}
      </span>
    </>
  );
}

const DOUBLE_PRESS_GUARD_MS = 400;
