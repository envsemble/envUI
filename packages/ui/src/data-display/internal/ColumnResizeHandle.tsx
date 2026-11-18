'use client';

import { useEffect } from 'react';
import { useResize } from '../../internal/resize/useResize.js';
import type { TableColumns } from './tableColumns.js';
import '../../styles/Base.css';
import '../../styles/Table.css';
import '../../styles/ColumnResizeHandle.css';

const columnResizeStepPercent = 1;
const columnResizeLargeStepPercent = 5;

function boundsSharedWithNextColumn(
  widths: readonly number[],
  minimums: readonly number[],
  column: number,
) {
  const pair = (widths[column] ?? 0) + (widths[column + 1] ?? 0);
  const min = Math.min(minimums[column] ?? 0, pair);
  return { min, max: Math.max(min, pair - (minimums[column + 1] ?? 0)) };
}

function moveBoundaryAfterColumn(
  widths: readonly number[],
  minimums: readonly number[],
  column: number,
  deltaPercent: number,
) {
  if (column < 0 || column + 1 >= widths.length) return [...widths];
  const { min, max } = boundsSharedWithNextColumn(widths, minimums, column);
  const pair = widths[column] + widths[column + 1];
  const width = Math.min(max, Math.max(min, widths[column] + deltaPercent));
  const next = [...widths];
  next[column] = width;
  next[column + 1] = pair - width;
  return next;
}

const tableOf = (handle: HTMLElement) => handle.closest('table');

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
  const { min, max } = boundsSharedWithNextColumn(widths, minimums, column);
  const {
    handleProps: { 'data-axis': _alwaysInline, ...handleProps },
    dragging,
  } = useResize({
    axis: 'inline',
    unit: '%',
    percentOf: tableOf,
    value: width,
    min,
    max,
    step: columnResizeStepPercent,
    largeStep: columnResizeLargeStepPercent,
    onChange: (next, { committed }) =>
      change(moveBoundaryAfterColumn(widths, minimums, column, next - width), committed),
    valueText: (value) => `${Math.round(value)}%`,
  });
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
