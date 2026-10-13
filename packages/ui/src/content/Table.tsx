import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';

export interface TableProps extends Omit<ComponentPropsWithRef<'table'>, 'aria-label'> {
  /** Accessible name of the table and its scroll region when there is no caption. */
  'aria-label'?: string;
  /** A visible caption that names the table. */
  caption?: ReactNode;
  /** standard (default) rows, or compact rows for dense data. */
  density?: 'compact' | 'standard';
  /** The header row stays visible while the table scrolls within its own region; give it a height. */
  stickyHeader?: boolean;
  /** Class of the scroll region around the table, for example to limit its height. */
  regionClassName?: string;
}

/** A semantic data table on a rounded surface that scrolls sideways when columns do not fit. */
export function Table({
  'aria-label': label,
  caption,
  density = 'standard',
  stickyHeader = false,
  regionClassName,
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  return (
    <div
      className={classNames('env-table-region', regionClassName)}
      role="region"
      // The region is a tab stop so keyboard users can scroll wide tables.
      tabIndex={0}
      aria-label={caption == null ? label : undefined}
      aria-labelledby={caption == null ? undefined : captionId}
      data-sticky-header={stickyHeader ? '' : undefined}
    >
      <table
        {...props}
        aria-label={caption == null ? label : undefined}
        className={classNames('env-table', className)}
        data-density={density}
      >
        {caption != null && (
          <caption id={captionId} className="env-table-caption">
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}

export type TableHeadProps = ComponentPropsWithRef<'thead'>;

export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead {...props} className={classNames('env-table-head', className)} />;
}

export type TableBodyProps = ComponentPropsWithRef<'tbody'>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody {...props} className={classNames('env-table-body', className)} />;
}

export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  /** The row reacts to hover, for rows that open something through a link or button inside. */
  interactive?: boolean;
}

export function TableRow({ interactive = false, className, ...props }: TableRowProps) {
  return (
    <tr
      {...props}
      className={classNames('env-table-row', className)}
      data-interactive={interactive ? '' : undefined}
    />
  );
}

interface TableCellLayout {
  /** start (default) or end alignment. */
  align?: 'start' | 'end';
  /** Tabular figures aligned to the end, for numbers that compare down a column. */
  numeric?: boolean;
  /** Keep the content on one line. */
  nowrap?: boolean;
}

function cellAttributes({ align, numeric, nowrap }: TableCellLayout) {
  return {
    'data-align': (align ?? (numeric ? 'end' : 'start')) as string,
    'data-numeric': numeric ? '' : undefined,
    'data-nowrap': nowrap ? '' : undefined,
  };
}

export interface TableHeaderCellProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>,
    TableCellLayout {}

export function TableHeaderCell({
  align,
  numeric,
  nowrap,
  scope = 'col',
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      {...props}
      scope={scope}
      className={classNames('env-table-header-cell', className)}
      {...cellAttributes({ align, numeric, nowrap })}
    />
  );
}

export interface TableCellProps
  extends Omit<ComponentPropsWithRef<'td'>, 'align'>,
    TableCellLayout {}

export function TableCell({ align, numeric, nowrap, className, ...props }: TableCellProps) {
  return (
    <td
      {...props}
      className={classNames('env-table-cell', className)}
      {...cellAttributes({ align, numeric, nowrap })}
    />
  );
}
