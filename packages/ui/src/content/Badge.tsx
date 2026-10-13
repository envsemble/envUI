import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'done';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Meaning of the state; done is the purple of completed work. Neutral by default. */
  tone?: BadgeTone;
  /** subtle (default) tints the background, solid fills it with the tone, outline draws a border. */
  variant?: 'subtle' | 'solid' | 'outline';
  icon?: ReactNode;
  children: ReactNode;
}

/** A small pill label for a state, such as In progress, Blocked or Archived, or a short name. */
export function Badge({
  tone = 'neutral',
  variant = 'subtle',
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={classNames('env-badge', className)}
      data-tone={tone}
      data-variant={variant}
    >
      {icon != null && <DecorativeIcon>{icon}</DecorativeIcon>}
      <span className="env-badge-label">{children}</span>
    </span>
  );
}

export interface CounterProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  value: number | string;
  /** Full meaning for assistive technology, such as "12 unread"; the number alone otherwise. */
  'aria-label'?: string;
  /** neutral (default) is a quiet fill; accent draws attention. */
  tone?: 'neutral' | 'accent';
}

/** A compact rounded count, for example beside a navigation label or a menu item. */
export function Counter({
  value,
  'aria-label': label,
  tone = 'neutral',
  className,
  ...props
}: CounterProps) {
  return (
    <span {...props} className={classNames('env-counter', className)} data-tone={tone}>
      {label === undefined ? (
        value
      ) : (
        <>
          <span aria-hidden="true">{value}</span>
          <span className="env-counter-label">{label}</span>
        </>
      )}
    </span>
  );
}
