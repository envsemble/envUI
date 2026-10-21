'use client';

import {
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  type ButtonAppearanceProps,
  type ButtonEmphasisProps,
  type ButtonTone,
  type ButtonVariant,
} from './Button.js';
import { ButtonBase } from './internal/ButtonBase.js';
import { classNames } from '../internal/classNames.js';
import { useButtonEmphasis } from '../internal/ControlDefaults.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { confirmButton } from '../foundations/messages/confirmButton.js';

type ConfirmButtonBaseProps = Omit<ButtonAppearanceProps, 'variant' | 'tone'> &
  Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'type'> & {
    /** The label while armed, naming what a second press does, such as “Remove Morgan?”. */
    confirmLabel: ReactNode;
    /** Runs on the second press, while the button is armed. */
    onConfirm: () => void;
    /** How long the button stays armed without a second press, in milliseconds. */
    armedDuration?: number;
  };

/**
 * The resting emphasis, among Button's designed pairs; armed, the button is always a primary danger
 * one. Without a variant it takes its container's, such as ghost in a toolbar, and else outline, or
 * secondary for an icon-only button, like IconButton; variant="primary" tone="danger" looks armed at
 * rest too. `RestingTone` is the tones the variant it falls back to takes. As Button's, the pairs
 * nest by tone, so a variant typed as a union of variants takes the tones all of them take.
 */
type ConfirmButtonEmphasisProps<RestingTone extends ButtonTone> =
  | {
      /**
       * The resting appearance; armed, the button is always variant="primary" tone="danger".
       * Without it, the container's variant, such as ghost in a toolbar, and else outline, or
       * secondary for an icon-only button, like IconButton.
       * @default 'outline', or 'secondary' with icon
       */
      variant?: undefined;
      /**
       * The resting meaning, as Button's: neutral, or danger on a primary, outline, ghost or text
       * button.
       * @default 'neutral'
       */
      tone?: RestingTone;
    }
  | { variant: ButtonVariant; tone?: 'neutral' }
  | { variant: 'primary' | 'outline' | 'ghost' | 'text'; tone?: 'neutral' | 'danger' }
  | { variant: 'primary'; tone?: ButtonTone };

export type ConfirmButtonProps = ConfirmButtonBaseProps &
  (
    | ({ icon?: undefined } & ConfirmButtonEmphasisProps<'neutral' | 'danger'>)
    | ({
        /**
         * A round icon-only button at rest, named by aria-label. Armed, it shows the icon with the
         * confirm label, so the consequence is still named.
         */
        icon: ReactNode;
        'aria-label': string;
        children?: never;
      } & ConfirmButtonEmphasisProps<'neutral'>)
  );

/**
 * A button for an action that takes effect at once and cannot be undone. The first press arms it and
 * names the consequence in place; a second press runs it. It disarms after a few seconds, when focus
 * leaves and on Escape.
 */
export function ConfirmButton({
  icon,
  variant,
  tone,
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
  const messages = useMessages('confirmButton', confirmButton);
  // At rest the button follows its container's variant, as Button does, but falls back to outline.
  // The rule resolves to a designed pair.
  const resting = useButtonEmphasis({
    variant,
    tone,
    fallbackVariant: icon == null ? 'outline' : 'secondary',
  }) as ButtonEmphasisProps;
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
    ...(armed ? { variant: 'primary' as const, tone: 'danger' as const } : resting),
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
        <ButtonBase
          {...shared}
          fallbackVariant="primary"
          iconOnly
          icon={icon}
          aria-label={label ?? ''}
        />
      ) : (
        <ButtonBase
          {...shared}
          fallbackVariant="primary"
          startIcon={armed && icon != null ? icon : startIcon}
          endIcon={endIcon}
          // Armed, the visible confirm label names the button.
          aria-label={armed ? undefined : label}
        >
          {armed ? confirmLabel : children}
        </ButtonBase>
      )}
      {/* A label change on a focused button is not reliably announced, so the armed state is. */}
      <span className="env-confirm-button-status" role="status">
        {armed && (
          <>
            {confirmLabel} {messages.armed}
          </>
        )}
      </span>
    </>
  );
}

const DOUBLE_PRESS_GUARD_MS = 400;
