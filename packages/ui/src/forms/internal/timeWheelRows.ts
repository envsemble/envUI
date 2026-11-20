import '../../styles/Base.css';
import '../../styles/TimeList.css';

export type TimeWheelPart = 'hour' | 'minute' | 'dayPeriod';

export interface TimeWheelEntry {
  value: number;
  label: string;
  disabled: boolean;
  keys: string[];
}

export const shownRowsAsTimeListCssSetsThem = 5;

const fewestCopies = 5;
const rowsToScrollEachWayBeforeRecentring = 30;

export function copiesToScrollOnInBothDirections(count: number) {
  return Math.max(fewestCopies, 2 * Math.ceil(rowsToScrollEachWayBeforeRecentring / count) + 1);
}

export function wrapIndex(index: number, count: number) {
  return ((index % count) + count) % count;
}

export function nearestAvailable(
  entries: readonly TimeWheelEntry[],
  index: number,
  loop: boolean,
  direction: 0 | 1 | -1,
) {
  const count = entries.length;
  for (let distance = 0; distance < count; distance++) {
    for (const sign of direction ? [direction] : [1, -1]) {
      let candidate = index + sign * distance;
      if (loop) candidate = wrapIndex(candidate, count);
      if (candidate >= 0 && candidate < count && !entries[candidate].disabled) return candidate;
    }
  }
  return -1;
}

export function wheelMetrics(wheel: HTMLElement) {
  const row = wheel.querySelector<HTMLElement>('.env-time-list-row')?.offsetHeight || 1;
  return { row, offset: (wheel.clientHeight - row) / 2 };
}

export function topOf(wheel: HTMLElement, rowIndex: number, loop: boolean) {
  const { row, offset } = wheelMetrics(wheel);
  const paddingThatLetsEndRowsReachTheMiddle = loop ? 0 : offset;
  return rowIndex * row + paddingThatLetsEndRowsReachTheMiddle - offset;
}

export function centredRow(wheel: HTMLElement, loop: boolean, top = wheel.scrollTop) {
  const { row, offset } = wheelMetrics(wheel);
  const paddingThatLetsEndRowsReachTheMiddle = loop ? 0 : offset;
  return Math.round((top + offset - paddingThatLetsEndRowsReachTheMiddle) / row);
}
