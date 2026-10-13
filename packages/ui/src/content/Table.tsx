import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { setRef } from '../internal/setRef.js';
import { ArrowDownward } from '../icons/ArrowDownward.js';
import { ArrowUpward } from '../icons/ArrowUpward.js';
import { UnfoldMore } from '../icons/UnfoldMore.js';
import {
  columnBounds,
  columnMinimums,
  columnResizeLargeStep,
  columnResizeStep,
  resizeColumns,
  sameWidths,
} from './internal/TableColumns.js';

interface TableColumns {
  widths: readonly number[];
  minimums: readonly number[];
  resizable: boolean;
  /** The column whose resize handle is being dragged. */
  resizing: number | null;
  setResizing: (column: number | null) => void;
  change: (widths: number[]) => void;
  reset: () => void;
}

/** A table that stacks its rows names the role of each part, since display changes can drop them. */
const TableStackContext = createContext(false);
const TableColumnsContext = createContext<TableColumns | null>(null);
const TableSectionContext = createContext<'head' | 'body' | null>(null);

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
  /**
   * When the table's region is narrower than stackBelow: scroll (default) keeps the columns and
   * scrolls sideways; stack shows each body row as a block that starts with its first cell,
   * followed by the other cells with their labels. The header row is then visually hidden.
   */
  narrowLayout?: 'scroll' | 'stack';
  /**
   * The region width below which a table with narrowLayout="stack" stacks its rows, as a CSS length
   * such as 60rem or 480px; 36rem by default. Wide tables, such as seven sortable columns, need more.
   */
  stackBelow?: string;
  /**
   * Called with true when the rows stack and with false when the columns return, from the same
   * measurement as stackBelow, for example to show another sort control while the header row is
   * hidden. The region has data-stacked while the rows stack.
   */
  onStackedChange?: (stacked: boolean) => void;
  /** Column widths in percent of the table width, in column order and adding up to 100. */
  columnWidths?: readonly number[];
  /**
   * Starting column widths when the table owns them. Double-clicking a resize handle restores them,
   * or else the widths a controlled table started with.
   */
  defaultColumnWidths?: readonly number[];
  /** Called with every column's width when people resize a column. */
  onColumnWidthsChange?: (widths: number[]) => void;
  /** Smallest width of each column in percent, or one value for every column; 5 by default. */
  minColumnWidths?: number | readonly number[];
  /**
   * People can resize the columns with a handle at the end of each header cell but the last. Needs
   * columnWidths or defaultColumnWidths.
   */
  resizableColumns?: boolean;
}

/**
 * Whether a region is narrower than a probe sized to a CSS length, following both as they change.
 * It is measured after the markup is in the document, before the browser paints a client render;
 * server-rendered markup shows the columns until hydration measures it.
 */
function useNarrowerThan(
  region: RefObject<HTMLElement | null>,
  probe: RefObject<HTMLElement | null>,
  enabled: boolean,
  length: string,
) {
  const [narrower, setNarrower] = useState(false);
  useLayoutEffect(() => {
    const element = region.current;
    const threshold = probe.current;
    if (!enabled || !element || !threshold) return;
    const measure = () => setNarrower(element.clientWidth < threshold.offsetWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // A length in rem or em follows the text size.
    observer.observe(threshold);
    return () => observer.disconnect();
  }, [region, probe, enabled, length]);
  return enabled && narrower;
}

/** A semantic data table on a rounded surface that scrolls sideways when columns do not fit. */
export function Table({
  'aria-label': label,
  caption,
  density = 'standard',
  stickyHeader = false,
  regionClassName,
  narrowLayout = 'scroll',
  stackBelow = '36rem',
  onStackedChange,
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  minColumnWidths,
  resizableColumns = false,
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  const stack = narrowLayout === 'stack';
  const region = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const stacked = useNarrowerThan(region, probe, stack, stackBelow);
  // Reported before paint, so an application can show its own controls for the stacked rows at once.
  const reportedStacked = useRef(false);
  useLayoutEffect(() => {
    if (stacked === reportedStacked.current) return;
    reportedStacked.current = stacked;
    onStackedChange?.(stacked);
  }, [stacked, onStackedChange]);
  // Widths the table owns start over when the defaults change, for example with another column.
  const defaultsKey = defaultColumnWidths?.join(' ');
  const [chosen, setChosen] = useState({ key: defaultsKey, widths: defaultColumnWidths });
  if (chosen.key !== defaultsKey) setChosen({ key: defaultsKey, widths: defaultColumnWidths });
  const [startWidths] = useState(columnWidths);
  const [resizing, setResizing] = useState<number | null>(null);
  const widths = columnWidths ?? (chosen.key === defaultsKey ? chosen.widths : defaultColumnWidths);

  let columns: TableColumns | null = null;
  if (widths) {
    const change = (next: number[]) => {
      if (sameWidths(widths, next)) return;
      if (columnWidths === undefined) setChosen({ key: defaultsKey, widths: next });
      onColumnWidthsChange?.(next);
    };
    const starting = [defaultColumnWidths, startWidths].find(
      (candidate) => candidate?.length === widths.length,
    );
    columns = {
      widths,
      minimums: columnMinimums(minColumnWidths, widths.length),
      resizable: resizableColumns,
      resizing,
      setResizing,
      change,
      reset: () => change(starting ? [...starting] : widths.map(() => 100 / widths.length)),
    };
  }

  return (
    <div
      ref={region}
      className={classNames('env-table-region', regionClassName)}
      role="region"
      // The region is a tab stop so keyboard users can scroll wide tables.
      tabIndex={0}
      aria-label={caption == null ? label : undefined}
      aria-labelledby={caption == null ? undefined : captionId}
      data-sticky-header={stickyHeader ? '' : undefined}
      data-narrow-layout={stack ? 'stack' : undefined}
      data-stacked={stacked ? '' : undefined}
    >
      <table
        role={stack ? 'table' : undefined}
        aria-labelledby={stack && caption != null ? captionId : undefined}
        {...props}
        aria-label={caption == null ? label : undefined}
        className={classNames('env-table', className)}
        data-density={density}
        data-fixed-layout={widths ? '' : undefined}
        data-resizing={resizing === null ? undefined : ''}
      >
        {caption != null && (
          <caption id={captionId} className="env-table-caption">
            {caption}
          </caption>
        )}
        {widths && (
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ inlineSize: `${width}%` }} />
            ))}
          </colgroup>
        )}
        <TableStackContext value={stack}>
          <TableColumnsContext value={columns}>{children}</TableColumnsContext>
        </TableStackContext>
      </table>
      {stack && (
        <div
          ref={probe}
          className="env-table-stack-probe"
          aria-hidden="true"
          style={{ inlineSize: stackBelow }}
        />
      )}
    </div>
  );
}

export type TableHeadProps = ComponentPropsWithRef<'thead'>;

export function TableHead({ className, ...props }: TableHeadProps) {
  const stack = useContext(TableStackContext);
  return (
    <TableSectionContext value="head">
      <thead
        role={stack ? 'rowgroup' : undefined}
        {...props}
        className={classNames('env-table-head', className)}
      />
    </TableSectionContext>
  );
}

export type TableBodyProps = ComponentPropsWithRef<'tbody'>;

export function TableBody({ className, ...props }: TableBodyProps) {
  const stack = useContext(TableStackContext);
  return (
    <TableSectionContext value="body">
      <tbody
        role={stack ? 'rowgroup' : undefined}
        {...props}
        className={classNames('env-table-body', className)}
      />
    </TableSectionContext>
  );
}

export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  /** The row reacts to hover, for rows that open something through a link or button inside. */
  interactive?: boolean;
  /**
   * The row is selected: it reports aria-selected and takes the selection colors. Pass false to the
   * other rows of a table whose rows can be selected.
   */
  selected?: boolean;
}

export function TableRow({ interactive = false, selected, className, ...props }: TableRowProps) {
  const stack = useContext(TableStackContext);
  return (
    <tr
      role={stack ? 'row' : undefined}
      aria-selected={selected}
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

export type TableSortDirection = 'ascending' | 'descending' | 'none';

export interface TableHeaderCellProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>,
    TableCellLayout {
  /** The column's sort order, announced on the header. Use it with onSort. */
  sortDirection?: TableSortDirection;
  /** The header becomes a button that asks the application to sort the rows by this column. */
  onSort?: () => void;
  /**
   * Accessible name of the sort button, which says what pressing it does: the header followed by
   * "sort ascending" by default, or by "sort descending" while the column is sorted ascending.
   */
  sortLabel?: string;
  /** Accessible name of the column's resize handle; "Resize" followed by the header by default. */
  resizeLabel?: string;
}

/** The column at the inline end of a header cell, counting the columns that cells before it span. */
function useColumnIndex(cell: RefObject<HTMLTableCellElement | null>, enabled: boolean) {
  const [column, setColumn] = useState<number>();
  useLayoutEffect(() => {
    const element = cell.current;
    if (!enabled || !element?.parentElement) return;
    let end = -1;
    for (const sibling of element.parentElement.children) {
      if (sibling.tagName === 'TH' || sibling.tagName === 'TD')
        end += (sibling as HTMLTableCellElement).colSpan;
      if (sibling === element) break;
    }
    setColumn(end);
  });
  return enabled ? column : undefined;
}

const sortIcons = {
  ascending: <ArrowUpward />,
  descending: <ArrowDownward />,
  none: <UnfoldMore />,
};

export function TableHeaderCell({
  align,
  numeric,
  nowrap,
  scope = 'col',
  sortDirection,
  onSort,
  sortLabel,
  resizeLabel,
  className,
  children,
  ref,
  ...props
}: TableHeaderCellProps) {
  const stack = useContext(TableStackContext);
  const columns = useContext(TableColumnsContext);
  const section = useContext(TableSectionContext);
  const id = useId();
  const cell = useRef<HTMLTableCellElement>(null);
  const setCell = useCallback(
    (node: HTMLTableCellElement | null) => {
      cell.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  const column = useColumnIndex(cell, section === 'head' && columns?.resizable === true);
  const handle = columns && column !== undefined && column + 1 < columns.widths.length;
  const sortable = onSort !== undefined;
  // The header keeps its own text as its name; the controls inside add what they do to it through
  // aria-labelledby, so the children render once.
  const labelled = sortable || Boolean(handle);
  const label = labelled ? (
    <span id={`${id}-label`} className="env-table-header-label">
      {children}
    </span>
  ) : (
    children
  );
  return (
    <th
      role={stack ? (scope === 'row' ? 'rowheader' : 'columnheader') : undefined}
      aria-sort={sortable ? (sortDirection ?? 'none') : sortDirection}
      aria-labelledby={labelled && props['aria-label'] === undefined ? `${id}-label` : undefined}
      {...props}
      ref={setCell}
      scope={scope}
      className={classNames('env-table-header-cell', className)}
      data-sortable={sortable ? '' : undefined}
      data-resizable={handle ? '' : undefined}
      {...cellAttributes({ align, numeric, nowrap })}
    >
      {sortable ? (
        <button
          type="button"
          className="env-table-sort-button"
          aria-label={sortLabel}
          aria-labelledby={sortLabel === undefined ? `${id}-label ${id}-sort` : undefined}
          onClick={onSort}
        >
          {label}
          <DecorativeIcon>{sortIcons[sortDirection ?? 'none']}</DecorativeIcon>
        </button>
      ) : (
        label
      )}
      {sortable && sortLabel === undefined && (
        <span id={`${id}-sort`} hidden>
          {sortDirection === 'ascending' ? 'sort descending' : 'sort ascending'}
        </span>
      )}
      {handle && (
        <ColumnResizeHandle
          column={column}
          columns={columns}
          label={resizeLabel}
          labelledBy={`${id}-resize ${id}-label`}
        />
      )}
      {handle && resizeLabel === undefined && (
        <span id={`${id}-resize`} hidden>
          Resize
        </span>
      )}
    </th>
  );
}

function inlineDirection(element: Element) {
  return getComputedStyle(element).direction === 'rtl' ? -1 : 1;
}

/** A separator at the inline end of a header cell that moves the boundary to the next column. */
function ColumnResizeHandle({
  column,
  columns,
  label,
  labelledBy,
}: {
  column: number;
  columns: TableColumns;
  label?: string;
  labelledBy: string;
}) {
  const { widths, minimums, change, reset, resizing, setResizing } = columns;
  const drag = useRef<{
    pointerId: number;
    startX: number;
    tableWidth: number;
    widths: readonly number[];
    direction: number;
  } | null>(null);
  const width = widths[column]!;
  const { min, max } = columnBounds(widths, minimums, column);

  function dragTo(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current!;
    const delta = ((event.clientX - current.startX) * current.direction * 100) / current.tableWidth;
    change(resizeColumns(current.widths, minimums, column, delta));
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (event.type === 'pointerup') dragTo(event);
    // A cancelled drag, such as one the browser took over for scrolling, returns to where it began.
    else change([...current.widths]);
    drag.current = null;
    setResizing(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-labelledby={label === undefined ? labelledBy : undefined}
      aria-valuenow={Math.round(width)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      aria-valuetext={`${Math.round(width)}%`}
      tabIndex={0}
      className="env-table-column-resize"
      data-resizing={resizing === column ? '' : undefined}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const tableWidth = event.currentTarget.closest('table')?.getBoundingClientRect().width;
        if (!tableWidth) return;
        // Dragging selects no text and leaves focus where it is.
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          tableWidth,
          widths,
          direction: inlineDirection(event.currentTarget),
        };
        setResizing(column);
      }}
      onPointerMove={(event) => {
        if (drag.current?.pointerId === event.pointerId) dragTo(event);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={(event) => {
        if (drag.current?.pointerId !== event.pointerId) return;
        drag.current = null;
        setResizing(null);
      }}
      onDoubleClick={reset}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const step = event.shiftKey ? columnResizeLargeStep : columnResizeStep;
        const direction = inlineDirection(event.currentTarget);
        let next: number;
        if (event.key === 'ArrowRight') next = Math.round(width + step * direction);
        else if (event.key === 'ArrowLeft') next = Math.round(width - step * direction);
        else if (event.key === 'Home') next = min;
        else if (event.key === 'End') next = max;
        else return;
        event.preventDefault();
        change(resizeColumns(widths, minimums, column, next - width));
      }}
    />
  );
}

export interface TableCellProps
  extends Omit<ComponentPropsWithRef<'td'>, 'align'>,
    TableCellLayout {
  /**
   * The column's name, shown before the value while a table with narrowLayout="stack" stacks its
   * rows. Assistive technology reads the column header instead.
   */
  label?: ReactNode;
}

export function TableCell({
  align,
  numeric,
  nowrap,
  label,
  className,
  children,
  ...props
}: TableCellProps) {
  const stack = useContext(TableStackContext);
  const labelled = stack && label != null;
  return (
    <td
      role={stack ? 'cell' : undefined}
      {...props}
      className={classNames('env-table-cell', className)}
      data-labelled={labelled ? '' : undefined}
      {...cellAttributes({ align, numeric, nowrap })}
    >
      {labelled ? (
        <>
          <span className="env-table-cell-label" aria-hidden="true">
            {label}
          </span>
          <div className="env-table-cell-content">{children}</div>
        </>
      ) : (
        children
      )}
    </td>
  );
}
