'use client';

// A table's columns: the widths the table owns or is given and what resizing them changes, and
// the column a header cell ends at. Column widths are percentages of the table width, in column
// order, that add up to 100. How a handle moves a boundary is in ColumnResizeHandle.tsx, which
// only a table with resizable columns loads.
import { useLayoutEffect, useState, type RefObject } from 'react';
import type { RootProps } from '../Table.js';

/** What a table with resizable columns gives its header cells. */
export interface TableColumns {
  widths: readonly number[];
  minimums: readonly number[];
  resizable: boolean;
  /** Says whether a column's resize handle is being dragged. */
  setResizing: (resizing: boolean) => void;
  /** Sets the widths: committed false while dragging, true as a change is complete. */
  change: (widths: number[], committed: boolean) => void;
  reset: () => void;
}

/** The smallest width of a column in percent unless the application sets its own. */
const defaultMinColumnWidth = 5;

/** One minimum per column, from a single value for every column or a list in column order. */
function columnMinimums(minimum: number | readonly number[] | undefined, count: number) {
  return Array.from({ length: count }, (_, index) =>
    typeof minimum === 'number' ? minimum : (minimum?.[index] ?? defaultMinColumnWidth),
  );
}

function sameWidths(first: readonly number[] | undefined, second: readonly number[]) {
  return first?.length === second.length && first.every((width, index) => width === second[index]);
}

/**
 * A table's column widths, as it is given them or as it keeps them itself, and what its header
 * cells resize them with, or null without widths; and whether a handle is being dragged.
 */
export function useTableColumns({
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  minColumnWidths,
  resizableColumns,
}: Pick<
  RootProps,
  | 'columnWidths'
  | 'defaultColumnWidths'
  | 'onColumnWidthsChange'
  | 'minColumnWidths'
  | 'resizableColumns'
>) {
  // Widths the table owns start over when the defaults change, for example with another column.
  const defaultsKey = defaultColumnWidths?.join(' ');
  const [chosen, setChosen] = useState({ key: defaultsKey, widths: defaultColumnWidths });
  if (chosen.key !== defaultsKey) setChosen({ key: defaultsKey, widths: defaultColumnWidths });
  const [startWidths] = useState(columnWidths);
  const [resizing, setResizing] = useState(false);
  const widths = columnWidths ?? (chosen.key === defaultsKey ? chosen.widths : defaultColumnWidths);
  if (!widths) return { widths, columns: null, resizing };

  const change = (next: number[], committed: boolean) => {
    const same = sameWidths(widths, next);
    if (same && !committed) return;
    if (!same && columnWidths === undefined) setChosen({ key: defaultsKey, widths: next });
    onColumnWidthsChange?.(next, { committed });
  };
  const starting = [defaultColumnWidths, startWidths].find(
    (candidate) => candidate?.length === widths.length,
  );
  const columns: TableColumns = {
    widths,
    minimums: columnMinimums(minColumnWidths, widths.length),
    resizable: resizableColumns === true,
    setResizing,
    change,
    reset: () => change(starting ? [...starting] : widths.map(() => 100 / widths.length), true),
  };
  return { widths, columns, resizing };
}

/** The column at the inline end of a header cell, counting the columns that cells before it span. */
export function useColumnIndex(cell: RefObject<HTMLTableCellElement | null>, enabled: boolean) {
  const [column, setColumn] = useState<number>();
  // Read after every render: the column depends on the cells before this one, which are not in its
  // props. Setting the same column again renders nothing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const element = cell.current;
    if (!enabled || !element?.parentElement) return;
    let end = -1;
    for (const sibling of element.parentElement.children) {
      // A TH or TD is a table cell, which spans columns.
      if (sibling.tagName === 'TH' || sibling.tagName === 'TD')
        end += (sibling as HTMLTableCellElement).colSpan;
      if (sibling === element) break;
    }
    setColumn(end);
  });
  return enabled ? column : undefined;
}
