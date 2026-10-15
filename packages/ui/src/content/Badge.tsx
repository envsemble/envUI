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

export interface DiffCountProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Lines or items added, shown as +12 in the success tone. */
  additions: number;
  /** Lines or items removed, shown as −3 in the danger tone. */
  deletions: number;
  /** Full meaning for assistive technology; "12 added lines and 3 removed lines" by default. */
  formatLabel?: (additions: number, deletions: number) => string;
}

const defaultDiffLabel = (additions: number, deletions: number) =>
  `${additions} added ${additions === 1 ? 'line' : 'lines'} and ${deletions} removed ${deletions === 1 ? 'line' : 'lines'}`;

/**
 * The size of a change as one compact pill, such as +12 −3: additions in the success tone and
 * deletions in the danger tone, on a counter's quiet fill.
 */
export function DiffCount({
  additions,
  deletions,
  formatLabel = defaultDiffLabel,
  className,
  ...props
}: DiffCountProps) {
  return (
    <span {...props} className={classNames('env-diff-count', className)}>
      <span className="env-diff-count-additions" aria-hidden="true">
        +{additions}
      </span>
      <span className="env-diff-count-deletions" aria-hidden="true">
        −{deletions}
      </span>
      <span className="env-counter-label">{formatLabel(additions, deletions)}</span>
    </span>
  );
}
