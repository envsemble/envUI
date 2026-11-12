'use client';

import { useEffect } from 'react';
import { useResize } from '../../internal/resize/useResize.js';
import type { TableColumns } from './tableColumns.js';
import '../../styles/Base.css';
import '../../styles/Table.css';
import '../../styles/ColumnResizeHandle.css';

/**
 * Keyboard steps of a resize handle in percent: arrow keys, and Page Up, Page Down or arrow keys
 * with Shift.
 */
const columnResizeStep = 1;
const columnResizeLargeStep = 5;

/** The range a column can take while the boundary after it moves: only it and the next change. */
function columnBounds(widths: readonly number[], minimums: readonly number[], column: number) {
  const pair = (widths[column] ?? 0) + (widths[column + 1] ?? 0);
  const min = Math.min(minimums[column] ?? 0, pair);
  return { min, max: Math.max(min, pair - (minimums[column + 1] ?? 0)) };
}

/**
 * Move the boundary after a column by a number of percent. The column and the next one share the
 * change, so every other column and the width of the table stay as they are.
 */
function resizeColumns(
  widths: readonly number[],
  minimums: readonly number[],
  column: number,
  delta: number,
) {
  if (column < 0 || column + 1 >= widths.length) return [...widths];
  const { min, max } = columnBounds(widths, minimums, column);
  const pair = widths[column] + widths[column + 1];
  const width = Math.min(max, Math.max(min, widths[column] + delta));
  const next = [...widths];
  next[column] = width;
  next[column + 1] = pair - width;
  return next;
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
