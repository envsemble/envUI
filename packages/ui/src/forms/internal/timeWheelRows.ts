import '../../styles/Base.css';
import '../../styles/TimeList.css';

// The rows of a TimeList's wheels: their entries, and where each row sits as a wheel scrolls.

/** The part of the time a column chooses. */
export type Part = 'hour' | 'minute' | 'dayPeriod';

export interface Entry {
  /** The hour (of the day, or of its half on a 12-hour clock), the minute, or 0 for AM and 1 for PM. */
  value: number;
  label: string;
  disabled: boolean;
  /** What typing names it: digits, or the start of the day period's name. */
  keys: string[];
}

/** The rows a wheel shows, --env-time-list-rows in TimeList.css. */
export const shownRows = 5;

/** How many times a looping wheel repeats its entries: enough rows to scroll on in both ways. */
export function copiesOf(count: number) {
  return Math.max(5, 2 * Math.ceil(30 / count) + 1);
}

/** The index of the entry a row of a looping wheel shows, or any index wrapped around the entries. */
export function wrap(index: number, count: number) {
  return ((index % count) + count) % count;
}

/** The nearest entry at or around an index, in a direction or either, that can be chosen. */
export function nearestAvailable(
  entries: readonly Entry[],
  index: number,
  loop: boolean,
  direction: 0 | 1 | -1,
) {
  const count = entries.length;
  for (let distance = 0; distance < count; distance++) {
    for (const sign of direction ? [direction] : [1, -1]) {
      let candidate = index + sign * distance;
      if (loop) candidate = wrap(candidate, count);
      // In range, as checked first.
      if (candidate >= 0 && candidate < count && !entries[candidate]!.disabled) return candidate;
    }
  }
  return -1;
}

/** The row height, and the offset of the middle row from the wheel's top. */
export function wheelMetrics(wheel: HTMLElement) {
  const row = wheel.querySelector<HTMLElement>('.env-time-list-row')?.offsetHeight || 1;
  return { row, offset: (wheel.clientHeight - row) / 2 };
}

/**
 * The scroll position that puts a row in the middle. A wheel that doesn't loop is padded by the
 * offset, so its first and last rows reach the middle.
 */
export function topOf(wheel: HTMLElement, rowIndex: number, loop: boolean) {
  const { row, offset } = wheelMetrics(wheel);
  return rowIndex * row + (loop ? 0 : offset) - offset;
}

/** The row whose middle is at the wheel's middle, at its scroll position or another. */
export function centredRow(wheel: HTMLElement, loop: boolean, top = wheel.scrollTop) {
  const { row, offset } = wheelMetrics(wheel);
  const padding = loop ? 0 : offset;
  return Math.round((top + offset - padding) / row);
}
