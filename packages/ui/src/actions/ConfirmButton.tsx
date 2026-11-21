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
import { useButtonEmphasis } from '../internal/control/ControlDefaults.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { confirmButton } from '../foundations/messages/confirmButton.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Button.css';

type ConfirmButtonBaseProps = Omit<ButtonAppearanceProps, 'variant' | 'tone'> &
  Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'type'> & {
    /**
     * The label while armed: what a second press does, short and without a question mark, such
     * as “Remove Morgan”.
     */
    confirmLabel: ReactNode;
    /** Runs on the second press, while the button is armed. */
    onConfirm: () => void;
    /** How long the button stays armed without a second press, in milliseconds. */
    armedDuration?: number;
  };

type ConfirmButtonEmphasisProps<RestingTone extends ButtonTone> =
  | {
      variant?: undefined;
      /**
       * The resting meaning, as Button's: neutral, or danger on a primary, outline, ghost or text
       * button.
       * @default 'neutral'
       */
      tone?: RestingTone;
    }
  | {
      /**
       * The resting appearance; armed, the button is always variant="primary" tone="danger".
       * Without it, the container's variant, such as ghost in a toolbar, and else outline, or
       * secondary for an icon-only button, like IconButton.
       * @default 'outline', or 'secondary' with icon
       */
      variant: ButtonVariant;
      tone?: 'neutral';
    }
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
        /** The icon-only button's name at rest, such as Delete draft. */
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
  start,
  className,
  onBlur,
  onKeyDown,
  'aria-label': label,
  ...props
}: ConfirmButtonProps) {
  const messages = useMessages('confirmButton', confirmButton);
  const resting = useButtonEmphasis({
    variant,
    tone,
    fallbackVariant: icon == null ? 'outline' : 'secondary',
  }) as ButtonEmphasisProps;
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const unavailable = disabled || pending;
  if (unavailable && armedAt !== null) setArmedAt(null);
  const armed = armedAt !== null && !unavailable;
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
    'data-armed': flag(armed),
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (armedAt === null) {
        setArmedAt(event.timeStamp);
        return;
      }
      const secondClickOfTheArmingDoubleClick = event.timeStamp - armedAt < doubleClickInterval;
      if (secondClickOfTheArmingDoubleClick) return;
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
          start={armed && icon != null ? icon : start}
          aria-label={armed ? undefined : label}
        >
          {armed ? confirmLabel : children}
        </ButtonBase>
      )}
      <span className="env-confirm-button-status" role="status">
        {armed && (
          <>
            {confirmLabel}. {messages.armed}
          </>
        )}
      </span>
    </>
  );
}

const doubleClickInterval = 400;
