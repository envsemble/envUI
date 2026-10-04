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
}

export function Row({ title, detail, action, children, className, ...props }: RowProps) {
  return (
    <li {...props} className={classNames('env-row', 'env-connected-row', className)}>
      <div>
        {title}
        {detail != null && <small>{detail}</small>}
        {children}
      </div>
      {action}
    </li>
  );
}
