'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import type { RootProps } from '../Table.js';
import type { ResizeDetails } from '../../internal/resize/resizeDetails.js';
import { useControllableState } from '../../internal/react/useControllableState.js';

export interface TableColumns {
  widths: readonly number[];
  minimums: readonly number[];
  resizable: boolean;
  setResizing: (resizing: boolean) => void;
  change: (widths: number[], committed: boolean) => void;
  reset: () => void;
}

const defaultMinColumnWidthPercent = 5;

function columnMinimums(minimum: number | readonly number[] | undefined, count: number) {
  return Array.from({ length: count }, (_, index) =>
    typeof minimum === 'number' ? minimum : (minimum?.[index] ?? defaultMinColumnWidthPercent),
  );
}

function sameWidths(first: readonly number[] | undefined, second: readonly number[]) {
  return first?.length === second.length && first.every((width, index) => width === second[index]);
}

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
  const [shownWidths, changeWidths, keepOwn] = useControllableState<
    readonly number[] | undefined,
    number[],
    [ResizeDetails]
  >({ value: columnWidths, defaultValue: defaultColumnWidths, onChange: onColumnWidthsChange });
  const defaultsKey = defaultColumnWidths?.join(' ');
  const [ownStartedFrom, setOwnStartedFrom] = useState(defaultsKey);
  const ownStartsOverWithNewDefaults = ownStartedFrom !== defaultsKey;
  if (ownStartsOverWithNewDefaults) setOwnStartedFrom(defaultsKey);
  const widths = ownStartsOverWithNewDefaults ? keepOwn(defaultColumnWidths) : shownWidths;
  const [startWidths] = useState(columnWidths);
  const [resizing, setResizing] = useState(false);
  if (!widths) return { widths, columns: null, resizing };

  const change = (next: number[], committed: boolean) => {
    if (sameWidths(widths, next) && !committed) return;
    changeWidths(next, { committed });
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

export function useEndColumnIndex(cell: RefObject<HTMLTableCellElement | null>, enabled: boolean) {
  const [column, setColumn] = useState<number>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(function readColumnsAfterEveryRender() {
    const element = cell.current;
    if (!enabled || !element?.parentElement) return;
    let end = -1;
    for (const sibling of element.parentElement.children) {
      const spansColumns = sibling.tagName === 'TH' || sibling.tagName === 'TD';
      if (spansColumns) end += (sibling as HTMLTableCellElement).colSpan;
      if (sibling === element) break;
    }
    setColumn(end);
  });
  return enabled ? column : undefined;
}
