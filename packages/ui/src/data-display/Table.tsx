'use client';

import {
  createContext,
  memo,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import type { RowDensity } from '../foundations/Theme.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { remLength } from '../internal/dom/lengths.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useMergedRefs } from '../internal/react/useMergedRefs.js';
import { useStackedReport } from './internal/useStackedReport.js';
import { IconArrowDownward } from '../icons/ArrowDownward.js';
import { IconArrowUpward } from '../icons/ArrowUpward.js';
import { IconUnfoldMore } from '../icons/UnfoldMore.js';
import { useEndColumnIndex, useTableColumns, type TableColumns } from './internal/tableColumns.js';
import {
  inSkeleton,
  skeletonAttributes,
  type SkeletonProps,
} from '../internal/skeleton/skeleton.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import { optionModule, useOptionModule } from '../internal/react/useOptionModule.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { table as tableMessages } from '../foundations/messages/table.js';
import type { ResizeDetails } from '../internal/resize/resizeDetails.js';
import { flag } from '../internal/flag.js';
import { Slot } from '../internal/layout/Slot.js';
import { observeResize } from '../internal/dom/observeResize.js';
import '../styles/Base.css';
import '../styles/Table.css';

const StackingTableNamesPartRolesContext = createContext(false);
const TableColumnsContext = createContext<TableColumns | null>(null);
const TableSectionContext = createContext<'head' | 'body' | 'foot' | null>(null);

export interface RootProps
  extends Omit<ComponentPropsWithRef<'table'>, 'aria-label'>, SkeletonProps {
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
   * scrolls vertically too, so give it a height through regionProps or the surrounding layout.
   */
  stickyHeader?: boolean;
  /**
   * Drops the frame, the raised surface and the header's shaded band: a hairline under the header
   * and between the rows, the table lying on the surface around it.
   * @default false
   */
  plain?: boolean;
  /**
   * Props of the scroll region around the table, such as a class or a style that limits its
   * height, a ref for scrolling to a row or virtualising, data attributes or listeners. Its class
   * joins the region's; the region's role, name, tab stop and layout stay the table's.
   */
  regionProps?: Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'>;
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
   * such as 60rem or 480px, or a number of rem, such as 40 or "40". Wide tables, such as seven
   * sortable columns, need more.
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

const columnResizeLoadedOnlyByResizableTables = optionModule(
  () => import('./internal/ColumnResizeHandle.js'),
);

function useStackingAsTheContainerQueryLaidItOut(
  region: RefObject<HTMLElement | null>,
  table: RefObject<HTMLElement | null>,
  enabled: boolean,
  stackBelow: string | number,
) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const element = region.current;
    const grid = table.current;
    if (!enabled || !element || !grid) {
      setStacked(false);
      return;
    }
    const read = () => {
      const hiddenRegionLaysNothingOut = element.getClientRects().length === 0;
      if (hiddenRegionLaysNothingOut) return;
      setStacked(getComputedStyle(grid).getPropertyValue('--_table-stacked').trim() === '1');
    };
    read();
    return observeResize([element, grid], read);
  }, [region, table, enabled, stackBelow]);
  return enabled && stacked;
}

const defaultStackBelowRegionWidth = '36rem';
const keyboardScrollTabStop = 0;

/**
 * A semantic data table, in a focusable region that scrolls sideways when the columns do not fit.
 * It is a shell for rows of anything: the frame, the rows, their states and their layout are the
 * table's, and the cells place what they hold as given. It lies on a rounded raised surface, its
 * header on a shaded band and its rows parted by hairlines; plain drops the frame and the band.
 */
function Root({
  'aria-label': label,
  caption,
  density = 'md',
  stickyHeader = false,
  plain = false,
  regionProps,
  narrowLayout = 'scroll',
  stackBelow = defaultStackBelowRegionWidth,
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
  const labelledBy = caption != null ? captionId : props['aria-labelledby'];
  const stack = narrowLayout === 'stack';
  const region = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const stacked = useStackingAsTheContainerQueryLaidItOut(region, table, stack, stackBelow);
  useStackedReport(stacked, onStackedChange);
  const { widths, columns, resizing } = useTableColumns({
    columnWidths,
    defaultColumnWidths,
    onColumnWidthsChange,
    minColumnWidths,
    resizableColumns,
  });
  if (columns?.resizable) columnResizeLoadedOnlyByResizableTables.preload();
  const {
    ref: ownRegionRef,
    className: ownRegionClassName,
    style: ownRegionStyle,
    ...ownRegionProps
  } = regionProps ?? {};
  const stackBelowStyle = stack ? { '--_table-stack-below': remLength(stackBelow) } : undefined;
  const setRegion = useMergedRefs(region, ownRegionRef);

  return (
    <div
      {...ownRegionProps}
      ref={setRegion}
      className={classNames('env-table-region', ownRegionClassName)}
      {...skeletonAttributes(skeleton)}
      role="region"
      tabIndex={keyboardScrollTabStop}
      aria-label={labelledBy === undefined ? label : undefined}
      aria-labelledby={labelledBy}
      data-plain={flag(plain)}
      data-sticky-header={flag(stickyHeader)}
      data-narrow-layout={stack ? 'stack' : undefined}
      data-stacked={flag(stacked)}
      style={ownRegionStyle ? { ...ownRegionStyle, ...stackBelowStyle } : stackBelowStyle}
    >
      {inSkeleton(
        skeleton,
        <table
          role={stack ? 'table' : undefined}
          aria-labelledby={stack && caption != null ? captionId : undefined}
          {...props}
          ref={mergeRefs(table, ref)}
          aria-label={caption == null ? label : undefined}
          className={classNames('env-table', className)}
          data-density={density}
          data-fixed-layout={flag(widths)}
          data-resizing={flag(resizing)}
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
          <StackingTableNamesPartRolesContext value={stack}>
            <TableColumnsContext value={columns}>{children}</TableColumnsContext>
          </StackingTableNamesPartRolesContext>
        </table>,
      )}
    </div>
  );
}

export type HeadProps = ComponentPropsWithRef<'thead'>;

/** The header rows of a table, a native thead, which hold the column headers. */
function Head({ className, ...props }: HeadProps) {
  const stack = useContext(StackingTableNamesPartRolesContext);
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
  const stack = useContext(StackingTableNamesPartRolesContext);
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

export type FootProps = ComponentPropsWithRef<'tfoot'>;

/**
 * The summary rows of a table, a native tfoot, such as its totals, on the header's shaded band
 * under the rows.
 */
function Foot({ className, ...props }: FootProps) {
  const stack = useContext(StackingTableNamesPartRolesContext);
  return (
    <TableSectionContext value="foot">
      <tfoot
        role={stack ? 'rowgroup' : undefined}
        {...props}
        className={classNames('env-table-foot', className)}
      />
    </TableSectionContext>
  );
}

export interface RowProps extends ComponentPropsWithRef<'tr'> {
  /**
   * The row opens something through a link or button in a cell: it highlights on hover and while
   * focus is inside it. Mark that link or button `data-row-target` to stretch it over the row, so a
   * click anywhere in the row follows it and the row shows its focus ring; the other links, buttons
   * and fields in the row stay clickable above it.
   * @default false
   */
  interactive?: boolean;
  /**
   * The row is selected: it reports aria-selected and takes the selection colors, with a bar at its
   * start. Pass false to the other rows of a table whose rows can be selected; unset, a row reports
   * no selection state.
   */
  selected?: boolean;
}

/** A row of a table, a native tr, which can open something, highlight on hover or be selected. */
function Row({ interactive = false, selected, className, ...props }: RowProps) {
  const stack = useContext(StackingTableNamesPartRolesContext);
  return (
    <tr
      role={stack ? 'row' : undefined}
      aria-selected={selected}
      {...props}
      className={classNames('env-table-row', className)}
      data-interactive={flag(interactive)}
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
    'data-align': align ?? (numeric ? 'end' : 'start'),
    'data-numeric': flag(numeric),
    'data-nowrap': flag(nowrap),
  };
}

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface HeaderCellProps
  extends Omit<ComponentPropsWithRef<'th'>, 'align'>, TableCellLayout {
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
  /**
   * Content at the end of the header, beside its sort button and outside it, such as a column
   * menu, a filter IconButton, a help Tooltip's trigger or a select-all Checkbox, placed as given.
   * The header's name stays its label.
   */
  end?: ReactNode;
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
  end,
  className,
  children,
  ref,
  ...props
}: HeaderCellProps) {
  const messages = useMessages('table', tableMessages);
  const stack = useContext(StackingTableNamesPartRolesContext);
  const columns = useContext(TableColumnsContext);
  const section = useContext(TableSectionContext);
  const id = useId();
  const cell = useRef<HTMLTableCellElement>(null);
  const setCell = useMergedRefs(cell, ref);
  const column = useEndColumnIndex(cell, section === 'head' && columns?.resizable === true);
  const resize = useOptionModule(
    columnResizeLoadedOnlyByResizableTables,
    columns?.resizable === true,
  );
  const handle = resize && columns && column !== undefined && column + 1 < columns.widths.length;
  const sortable = onSortChange !== undefined;
  const nextSort = sortDirection === 'ascending' ? 'descending' : 'ascending';
  const controlsAddTheirActionToTheHeadersName = sortable || Boolean(handle);
  const hasEnd = end != null;
  const ownLabel = props['aria-label'];
  const nameIds =
    props['aria-labelledby'] ?? (ownLabel !== undefined ? `${id}-name` : `${id}-label`);
  const label =
    controlsAddTheirActionToTheHeadersName || hasEnd ? (
      <span id={`${id}-label`} className="env-table-header-label">
        {children}
      </span>
    ) : (
      children
    );
  const sortButton = () => (
    <ActionElement
      className="env-table-sort-button"
      aria-label={sortLabel}
      aria-labelledby={sortLabel === undefined ? `${nameIds} ${id}-sort` : undefined}
      onClick={() => onSortChange?.(nextSort)}
    >
      {label}
      <DecorativeIcon>{sortIcons[sortDirection ?? 'none']}</DecorativeIcon>
    </ActionElement>
  );
  return (
    <th
      role={stack ? (scope === 'row' ? 'rowheader' : 'columnheader') : undefined}
      aria-sort={sortable ? (sortDirection ?? 'none') : sortDirection}
      aria-labelledby={
        (controlsAddTheirActionToTheHeadersName || hasEnd) && props['aria-label'] === undefined
          ? `${id}-label`
          : undefined
      }
      {...props}
      ref={setCell}
      scope={scope}
      className={classNames('env-table-header-cell', className)}
      data-sortable={flag(sortable)}
      data-resizable={flag(handle)}
      {...cellAttributes({ align, numeric, nowrap })}
    >
      {hasEnd ? (
        <div className="env-table-header-content">
          {sortable ? sortButton() : label}
          <Slot className="env-table-header-end" layout="row" shrink="never">
            {end}
          </Slot>
        </div>
      ) : sortable ? (
        sortButton()
      ) : (
        label
      )}
      {controlsAddTheirActionToTheHeadersName && nameIds === `${id}-name` && (
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
        <resize.ColumnResizeHandle
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

/**
 * A data cell, a native td, which places what it holds as given, with a label that names its value
 * while rows stack.
 */
function Cell({ align, numeric, nowrap, label, className, children, ...props }: CellProps) {
  const stack = useContext(StackingTableNamesPartRolesContext);
  const labelled = stack && label != null;
  return (
    <td
      role={stack ? 'cell' : undefined}
      {...props}
      className={classNames('env-table-cell', className)}
      data-labelled={flag(labelled)}
      {...cellAttributes({ align, numeric, nowrap })}
    >
      {labelled ? (
        <>
          <span className="env-table-cell-label" aria-hidden="true">
            {label}
          </span>
          <Slot className="env-table-cell-content">{children}</Slot>
        </>
      ) : (
        children
      )}
    </td>
  );
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Table.Root');
const HeadPart = /* @__PURE__ */ withDisplayName(Head, 'Table.Head');
const BodyPart = /* @__PURE__ */ withDisplayName(Body, 'Table.Body');
const FootPart = /* @__PURE__ */ withDisplayName(Foot, 'Table.Foot');
const RowPart = /* @__PURE__ */ withDisplayName(Row, 'Table.Row');
const HeaderCellPart = /* @__PURE__ */ withDisplayName(HeaderCell, 'Table.HeaderCell');
const CellRenderedAgainOnlyWhenItsPropsChange = /* @__PURE__ */ memo(Cell);
const CellPart = /* @__PURE__ */ withDisplayName(
  CellRenderedAgainOnlyWhenItsPropsChange,
  'Table.Cell',
);
export {
  RootPart as Root,
  HeadPart as Head,
  BodyPart as Body,
  FootPart as Foot,
  RowPart as Row,
  HeaderCellPart as HeaderCell,
  CellPart as Cell,
};
