import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface CounterBadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The count, such as 12, or short text such as 99+; shown in tabular figures. */
  value: number | string;
  /** Full meaning for assistive technology, such as "12 unread"; the number alone otherwise. */
  'aria-label'?: string;
  /** neutral (default) is a quiet fill; accent draws attention. */
  tone?: 'neutral' | 'accent';
}

/** A compact rounded count, for example beside a navigation label or a menu item. */
export function CounterBadge({
  value,
  'aria-label': label,
  tone = 'neutral',
  className,
  ...props
}: CounterBadgeProps) {
  return (
    <span {...props} className={classNames('env-counter-badge', className)} data-tone={tone}>
      {label === undefined ? (
        value
      ) : (
        <>
          <span aria-hidden="true">{value}</span>
          <span className="env-counter-badge-label">{label}</span>
        </>
      )}
    </span>
  );
}
