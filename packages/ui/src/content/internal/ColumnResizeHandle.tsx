'use client';

import { useEffect } from 'react';
import { useResize } from '../../internal/useResize.js';
import {
  columnBounds,
  columnResizeLargeStep,
  columnResizeStep,
  resizeColumns,
} from './tableColumns.js';
import '../../styles/Base.css';
import '../../styles/Table.css';

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

const tableOf = (handle: HTMLElement) => handle.closest('table');

/**
 * A separator at the inline end of a header cell that moves the boundary to the next column: a
 * window splitter's handle on useResize, its size the column's width in percent of the table.
 */
export function ColumnResizeHandle({
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
  const { widths, minimums, change, reset, setResizing } = columns;
  const width = widths[column];
  const { min, max } = columnBounds(widths, minimums, column);
  // A column's handle always moves along the inline axis, so its part takes no data-axis.
  const {
    handleProps: { 'data-axis': _axis, ...handleProps },
    dragging,
  } = useResize({
    axis: 'inline',
    unit: '%',
    percentOf: tableOf,
    value: width,
    min,
    max,
    step: columnResizeStep,
    largeStep: columnResizeLargeStep,
    // Only this column and the next change, so the boundary moves to the new width from any widths.
    onChange: (next, { committed }) =>
      change(resizeColumns(widths, minimums, column, next - width), committed),
    valueText: (value) => `${Math.round(value)}%`,
  });
  // The table shows that a column is resizing while this handle is dragged.
  useEffect(() => {
    if (!dragging) return;
    setResizing(true);
    return () => setResizing(false);
  }, [dragging, setResizing]);

  return (
    <div
      {...handleProps}
      aria-label={label}
      aria-labelledby={label === undefined ? labelledBy : undefined}
      className="env-table-column-resize-handle"
      onDoubleClick={reset}
    />
  );
}
