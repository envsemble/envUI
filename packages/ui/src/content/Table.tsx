'use client';

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import type { RowDensity } from '../foundations/Theme.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { remLength } from '../internal/cssLength.js';
import { setRef } from '../internal/setRef.js';
import { useStackedReport } from '../internal/useStackedReport.js';
import { IconArrowDownward } from '../icons/ArrowDownward.js';
import { IconArrowUpward } from '../icons/ArrowUpward.js';
import { IconUnfoldMore } from '../icons/UnfoldMore.js';
import { columnMinimums, sameWidths } from './internal/tableColumns.js';
import { ColumnResizeHandle, type TableColumns } from './internal/ColumnResizeHandle.js';
import { inSkeleton } from '../foundations/internal/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { ActionElement } from '../internal/ActionElement.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { table as tableMessages } from '../foundations/messages/table.js';
import type { ResizeDetails } from '../internal/resizeDetails.js';
import '../styles/Base.css';
import '../styles/Table.css';

/** A table that stacks its rows names the role of each part, since display changes can drop them. */
const TableStackContext = createContext(false);
const TableColumnsContext = createContext<TableColumns | null>(null);
const TableSectionContext = createContext<'head' | 'body' | null>(null);

export interface RootProps
  extends Omit<ComponentPropsWithRef<'table'>, 'aria-label'>,
    SkeletonProps {
  /**
   * Accessible name of the table and its scroll region when there is no caption. A table needs a
   * caption, an aria-label or an aria-labelledby, which names its region too.
   */
  'aria-label'?: string;
  /**
   * A visible caption above the rows that names the table and its scroll region, in place of
   * aria-label or aria-labelledby. Under a sticky header it scrolls away with the rows.
   */
  caption?: ReactNode;
  /**
   * How tightly the rows pack: xs, sm, md or lg changes only the cells' block padding, never the
   * text. Buttons, icon buttons and fields in the cells take the small control height in every
   * density, unless they set a size.
   * @default 'md'
   */
  density?: RowDensity;
  /**
   * The header row stays at the top of the region while the rows scroll beneath it. The region then
   * scrolls vertically too, so give it a height through regionClassName or the surrounding layout.
   */
  stickyHeader?: boolean;
  /** Class of the scroll region around the table, for example to limit its height. */
  regionClassName?: string;
  /**
   * What the table does when its region is narrower than stackBelow: scroll keeps the columns and
   * scrolls sideways; stack shows each body row as a block that starts with its first cell,
   * followed by the other cells with their labels. The header row is then visually hidden. A
   * container query on the region decides it, so the server's markup and the first paint already
   * stack; a stacking region fills the width its context gives it.
   */
  narrowLayout?: 'scroll' | 'stack';
  /**
   * The region width below which a table with narrowLayout="stack" stacks its rows: a CSS length
   * such as 60rem or 480px, or a number of rem, such as 40 or "40", as PanelDock's. Wide tables,
   * such as seven sortable columns, need more.
   */
  stackBelow?: string | number;
  /**
   * Called with true when the rows stack and with false when the columns return, as the table
   * reads its layout once it is in the document, for example to show another sort control while
   * the header row is hidden; a table that leaves while its rows stack reports false. The region
   * has data-stacked from then on while the rows stack; style stacked rows with a container query
   * on env-table, which applies before hydration, rather than through it.
   */
  onStackedChange?: (stacked: boolean) => void;
  /**
   * Column widths in percent of the table width, in column order and adding up to 100, for widths
   * the application controls with onColumnWidthsChange. Set widths fix the columns: long words
   * wrap and nowrap cells end with an ellipsis.
   */
  columnWidths?: readonly number[];
  /**
   * Starting column widths, in percent, when the table owns them; other defaults start them over.
   * Double-clicking a resize handle restores them, or else the widths a controlled table started
   * with.
   */
  defaultColumnWidths?: readonly number[];
  /**
   * Called with every column's width when people resize a column: while dragging a handle with
   * committed false, and with committed true as a drag ends, a key moves it or a double click
   * resets the widths.
   */
  onColumnWidthsChange?: (widths: number[], details: ResizeDetails) => void;
  /**
   * Smallest width of each column in percent, in column order, or one value for every column.
   * @default 5
   */
  minColumnWidths?: number | readonly number[];
  /**
   * People can resize the columns with a handle at the end of each header cell but the last, which
   * moves the boundary to the next column and keeps the table's width. Needs columnWidths or
   * defaultColumnWidths.
   */
  resizableColumns?: boolean;
}

/**
 * Whether a stacking table's rows are stacked, as its container query on the region laid them
 * out: read from the table's --env-table-stacked once it is in the document, and again as the
 * region or the table resizes. CSS decides the layout; this only reports it, so the server's
 * markup and the first paint already stack where the region is narrow.
 */
function useStacked(
  region: RefObject<HTMLElement | null>,
  table: RefObject<HTMLElement | null>,
  enabled: boolean,
  stackBelow: string | number,
) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const element = region.current;
    const grid = table.current;
    // A table that stops stacking starts over, so stacking again never reuses an old reading.
    if (!enabled || !element || !grid) {
      setStacked(false);
      return;
    }
    const read = () => {
      // A hidden region, such as one in a hidden tab panel, lays nothing out; it keeps its state
      // until it shows again.
      if (element.getClientRects().length === 0) return;
      setStacked(getComputedStyle(grid).getPropertyValue('--env-table-stacked').trim() === '1');
    };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    // The table changes size as its rows stack, and as the text size changes the threshold.
    observer.observe(grid);
    return () => observer.disconnect();
  }, [region, table, enabled, stackBelow]);
  return enabled && stacked;
}

/**
 * The region width below which a stacking table stacks. Not a window class: the region measures its
 * own width, often narrower than the window's, and a wide table sets more with stackBelow.
 */
const defaultStackBelow = '36rem';

/**
 * A semantic data table on a rounded surface, in a focusable region that scrolls sideways when the
 * columns do not fit.
 */
function Root({
  'aria-label': label,
  caption,
  density = 'md',
  stickyHeader = false,
  regionClassName,
  narrowLayout = 'scroll',
  stackBelow = defaultStackBelow,
  onStackedChange,
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  minColumnWidths,
  resizableColumns = false,
  skeleton = false,
  className,
  children,
  ref,
  ...props
}: RootProps) {
  const captionId = useId();
  // The region takes the table's name, from its caption, aria-labelledby or aria-label, so a
  // keyboard user who scrolls it hears what it holds.
  const labelledBy = caption != null ? captionId : props['aria-labelledby'];
  const stack = narrowLayout === 'stack';
  const region = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const stacked = useStacked(region, table, stack, stackBelow);
  useStackedReport(stacked, onStackedChange);
  // Widths the table owns start over when the defaults change, for example with another column.
  const defaultsKey = defaultColumnWidths?.join(' ');
  const [chosen, setChosen] = useState({ key: defaultsKey, widths: defaultColumnWidths });
  if (chosen.key !== defaultsKey) setChosen({ key: defaultsKey, widths: defaultColumnWidths });
  const [startWidths] = useState(columnWidths);
  const [resizing, setResizing] = useState<number | null>(null);
  const widths = columnWidths ?? (chosen.key === defaultsKey ? chosen.widths : defaultColumnWidths);

  let columns: TableColumns | null = null;
  if (widths) {
    const change = (next: number[], committed: boolean) => {
      const same = sameWidths(widths, next);
      if (same && !committed) return;
      if (!same && columnWidths === undefined) setChosen({ key: defaultsKey, widths: next });
      onColumnWidthsChange?.(next, { committed });
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
      reset: () => change(starting ? [...starting] : widths.map(() => 100 / widths.length), true),
    };
  }

  return (
    <div
      ref={region}
      className={classNames('env-table-region', regionClassName)}
      {...skeletonAttributes(skeleton)}
      role="region"
      // The region is a tab stop so keyboard users can scroll wide tables.
      tabIndex={0}
      aria-label={labelledBy === undefined ? label : undefined}
      aria-labelledby={labelledBy}
      data-sticky-header={stickyHeader ? '' : undefined}
      data-narrow-layout={stack ? 'stack' : undefined}
      data-stacked={stacked ? '' : undefined}
      // The container query compares the region with 37.5em, an em of stackBelow / 37.5: in a
      // query, em is the container's own.
      style={
        stack ? ({ '--env-table-stack-below': remLength(stackBelow) } as CSSProperties) : undefined
      }
    >
      {inSkeleton(
        skeleton,
        <table
          role={stack ? 'table' : undefined}
          aria-labelledby={stack && caption != null ? captionId : undefined}
          {...props}
          ref={(node) => {
            table.current = node;
            setRef(ref, node);
          }}
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
        </table>,
      )}
    </div>
  );
}

export type HeadProps = ComponentPropsWithRef<'thead'>;

/** The header rows of a table, a native thead, which hold the column headers. */
function Head({ className, ...props }: HeadProps) {
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

export type BodyProps = ComponentPropsWithRef<'tbody'>;

/** The data rows of a table, a native tbody, separated by hairlines. */
function Body({ className, ...props }: BodyProps) {
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

export interface RowProps extends ComponentPropsWithRef<'tr'> {
  /**
   * The row highlights on hover and while focus is inside it, for rows that open something through
   * a link or button in a cell. It adds no behavior of its own.
   */
  interactive?: boolean;
  /**
   * The row is selected: it reports aria-selected and takes the selection colors, with a bar at its
   * start. Pass false to the other rows of a table whose rows can be selected; unset, a row reports
   * no selection state.
   */
  selected?: boolean;
}

/** A row of a table, a native tr, which can highlight on hover or be selected. */
function Row({ interactive = false, selected, className, ...props }: RowProps) {
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
  /**
   * Aligns the content with the start or the end of the cell.
   * @default 'start', or 'end' with numeric
   */
  align?: 'start' | 'end';
  /**
   * Tabular figures aligned to the end, for numbers that compare down a column. In a sortable
   * header the arrow comes before the label, so the label lines up with the numbers.
   * @default false
   */
  numeric?: boolean;
  /**
   * Keeps the content on one line. In a table with set column widths, content that doesn't fit ends
   * with an ellipsis.
   * @default false
   */
  nowrap?: boolean;
}

function cellAttributes({ align, numeric, nowrap }: TableCellLayout) {
  return {
    'data-align': (align ?? (numeric ? 'end' : 'start')) as string,
    'data-numeric': numeric ? '' : undefined,
    'data-nowrap': nowrap ? '' : undefined,
  };
}

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface HeaderCellProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>,
    TableCellLayout {
  /**
   * The column's sort order: aria-sort on the header and the arrow in its sort button. Use it with
   * onSortChange; without it only sets aria-sort.
   * @default 'none' with onSortChange
   */
  sortDirection?: SortDirection;
  /**
   * The header becomes a button across the cell that asks the application to sort the rows by this
   * column, with the order pressing it asks for: descending while the column is sorted ascending,
   * ascending otherwise. The application sorts the rows and sets sortDirection.
   */
  onSortChange?: (next: 'ascending' | 'descending') => void;
  /**
   * Accessible name of the sort button, which says what pressing it does: the header's name
   * followed by "sort ascending", or by "sort descending" while the column is sorted ascending.
   * @default '{header} sort {next order}', from EnvUIProvider's messages.table.sortAscending and sortDescending
   */
  sortLabel?: string;
  /**
   * Accessible name of the column's resize handle, "Resize" followed by the header's name.
   * @default 'Resize {header}', from EnvUIProvider's messages.table.resize
   */
  resizeLabel?: string;
}

/** The column at the inline end of a header cell, counting the columns that cells before it span. */
function useColumnIndex(cell: RefObject<HTMLTableCellElement | null>, enabled: boolean) {
  const [column, setColumn] = useState<number>();
  // Read after every render: the column depends on the cells before this one, which are not in its
  // props. Setting the same column again renders nothing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  ascending: <IconArrowUpward />,
  descending: <IconArrowDownward />,
  none: <IconUnfoldMore />,
};

/**
 * A header cell, a native th that heads its column, or its row with scope="row". With onSortChange
 * it sorts its column; in a table with resizable columns it holds the column's resize handle.
 */
function HeaderCell({
  align,
  numeric,
  nowrap,
  scope = 'col',
  sortDirection,
  onSortChange,
  sortLabel,
  resizeLabel,
  className,
  children,
  ref,
  ...props
}: HeaderCellProps) {
  const messages = useMessages('table', tableMessages);
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
  const sortable = onSortChange !== undefined;
  const nextSort = sortDirection === 'ascending' ? 'descending' : 'ascending';
  // The header keeps its own name; the controls inside add what they do to it through
  // aria-labelledby, so the children render once. A header named by aria-labelledby or aria-label
  // lends that name to its controls.
  const labelled = sortable || Boolean(handle);
  const ownLabel = props['aria-label'];
  const nameIds =
    props['aria-labelledby'] ?? (ownLabel !== undefined ? `${id}-name` : `${id}-label`);
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
        <ActionElement
          className="env-table-sort-button"
          aria-label={sortLabel}
          aria-labelledby={sortLabel === undefined ? `${nameIds} ${id}-sort` : undefined}
          onClick={() => onSortChange(nextSort)}
        >
          {label}
          <DecorativeIcon>{sortIcons[sortDirection ?? 'none']}</DecorativeIcon>
        </ActionElement>
      ) : (
        label
      )}
      {labelled && nameIds === `${id}-name` && (
        <span id={`${id}-name`} hidden>
          {ownLabel}
        </span>
      )}
      {sortable && sortLabel === undefined && (
        <span id={`${id}-sort`} hidden>
          {nextSort === 'descending' ? messages.sortDescending : messages.sortAscending}
        </span>
      )}
      {handle && (
        <ColumnResizeHandle
          column={column}
          columns={columns}
          label={resizeLabel}
          labelledBy={`${id}-resize ${nameIds}`}
        />
      )}
      {handle && resizeLabel === undefined && (
        <span id={`${id}-resize`} hidden>
          {messages.resize}
        </span>
      )}
    </th>
  );
}

export interface CellProps extends Omit<ComponentPropsWithRef<'td'>, 'align'>, TableCellLayout {
  /**
   * The column's name, shown before the value while a table with narrowLayout="stack" stacks its
   * rows. Assistive technology reads the column header instead.
   */
  label?: ReactNode;
}

/** A data cell, a native td, with a label that names its value while rows stack. */
function Cell({ align, numeric, nowrap, label, className, children, ...props }: CellProps) {
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

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Table.Root');
const HeadPart = /* @__PURE__ */ withDisplayName(Head, 'Table.Head');
const BodyPart = /* @__PURE__ */ withDisplayName(Body, 'Table.Body');
const RowPart = /* @__PURE__ */ withDisplayName(Row, 'Table.Row');
const HeaderCellPart = /* @__PURE__ */ withDisplayName(HeaderCell, 'Table.HeaderCell');
// A cell whose props are unchanged, such as one holding text, renders nothing again when its row
// does: an application that renders its rows anew changes only the cells whose values changed.
const CellPart = /* @__PURE__ */ withDisplayName(/* @__PURE__ */ memo(Cell), 'Table.Cell');
export {
  RootPart as Root,
  HeadPart as Head,
  BodyPart as Body,
  RowPart as Row,
  HeaderCellPart as HeaderCell,
  CellPart as Cell,
};
