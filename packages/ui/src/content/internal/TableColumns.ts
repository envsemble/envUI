/** Column widths are percentages of the table width, in column order, that add up to 100. */

/** The smallest width of a column in percent unless the application sets its own. */
export const defaultMinColumnWidth = 5;
/** Keyboard steps of a resize handle in percent: arrow keys, and arrow keys with Shift. */
export const columnResizeStep = 1;
export const columnResizeLargeStep = 5;

/** One minimum per column, from a single value for every column or a list in column order. */
export function columnMinimums(minimum: number | readonly number[] | undefined, count: number) {
  return Array.from({ length: count }, (_, index) =>
    typeof minimum === 'number' ? minimum : (minimum?.[index] ?? defaultMinColumnWidth),
  );
}

/** The range a column can take while the boundary after it moves: only it and the next change. */
export function columnBounds(
  widths: readonly number[],
  minimums: readonly number[],
  column: number,
) {
  const pair = (widths[column] ?? 0) + (widths[column + 1] ?? 0);
  const min = Math.min(minimums[column] ?? 0, pair);
  return { min, max: Math.max(min, pair - (minimums[column + 1] ?? 0)) };
}

/**
 * Move the boundary after a column by a number of percent. The column and the next one share the
 * change, so every other column and the width of the table stay as they are.
 */
export function resizeColumns(
  widths: readonly number[],
  minimums: readonly number[],
  column: number,
  delta: number,
) {
  if (column < 0 || column + 1 >= widths.length) return [...widths];
  const { min, max } = columnBounds(widths, minimums, column);
  const pair = widths[column]! + widths[column + 1]!;
  const width = Math.min(max, Math.max(min, widths[column]! + delta));
  const next = [...widths];
  next[column] = width;
  next[column + 1] = pair - width;
  return next;
}

export function sameWidths(first: readonly number[] | undefined, second: readonly number[]) {
  return first?.length === second.length && first.every((width, index) => width === second[index]);
}
