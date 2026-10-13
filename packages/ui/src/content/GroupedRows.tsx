import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Surface } from '../foundations/Surface.js';

export interface GroupedRowsProps extends ComponentPropsWithRef<'ul'> {
  contrast?: boolean;
}

export function GroupedRows({ contrast = false, className, ...props }: GroupedRowsProps) {
  const rows = (
    <ul {...props} className={classNames('env-grouped-rows', 'env-connected-rows', className)} />
  );
  return contrast ? (
    <Surface tone="row" padding={3} className="env-contrast-row-pane">
      {rows}
    </Surface>
  ) : (
    rows
  );
}

export interface RowProps extends Omit<ComponentPropsWithRef<'li'>, 'title'> {
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  /**
   * The row opens something through a link or button inside: it reacts to hover, presses and focus
   * inside it, and is the containing block a link can stretch over to cover the row.
   */
  interactive?: boolean;
}

export function Row({
  title,
  detail,
  action,
  interactive = false,
  children,
  className,
  ...props
}: RowProps) {
  return (
    <li
      {...props}
      className={classNames('env-row', 'env-connected-row', className)}
      data-interactive={interactive ? '' : undefined}
    >
      <div>
        {title}
        {detail != null && <small>{detail}</small>}
        {children}
      </div>
      {action}
    </li>
  );
}
