'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { isRightToLeft } from '../../internal/direction.js';
import {
  columnBounds,
  columnResizeLargeStep,
  columnResizeStep,
  resizeColumns,
} from './tableColumns.js';
import '../../styles/Base.css';
import '../../styles/Table.css';
import { scrolledBy } from '../../internal/scrolledBy.js';

/** What a table with resizable columns gives its header cells. */
export interface TableColumns {
  widths: readonly number[];
  minimums: readonly number[];
  resizable: boolean;
  /** The column whose resize handle is being dragged. */
  resizing: number | null;
  setResizing: (column: number | null) => void;
  /** Sets the widths: committed false while dragging, true as a change is complete. */
  change: (widths: number[], committed: boolean) => void;
  reset: () => void;
}

function inlineDirection(element: Element) {
  return isRightToLeft(element) ? -1 : 1;
}

/** A separator at the inline end of a header cell that moves the boundary to the next column. */
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

  /**
   * How far the pointer has moved the boundary, as a share of the table, on the content: a box
   * scrolled around the table, such as its own, moves it as the pointer's move would.
   */
  function deltaOf(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current!;
    const x = event.clientX + scrolledBy(event.currentTarget, 'x');
    return ((x - current.startX) * current.direction * 100) / current.tableWidth;
  }

  function dragTo(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current!;
    change(resizeColumns(current.widths, minimums, column, deltaOf(event)), false);
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (event.type === 'pointerup') {
      change(resizeColumns(current.widths, minimums, column, deltaOf(event)), true);
    }
    // A cancelled drag, such as one the browser took over for scrolling, returns to where it began.
    else change([...current.widths], true);
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
      className="env-table-column-resize-handle"
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
          startX: event.clientX + scrolledBy(event.currentTarget, 'x'),
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
        change(resizeColumns(widths, minimums, column, next - width), true);
      }}
    />
  );
}
