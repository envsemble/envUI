import '../../styles/Base.css';
import '../../styles/TimeList.css';

export type Part = 'hour' | 'minute' | 'dayPeriod';

export interface Entry {
  value: number;
  label: string;
  disabled: boolean;
  keys: string[];
}

export const shownRowsAsTimeListCssSetsThem = 5;

export function copiesToScrollOnInBothDirections(count: number) {
  return Math.max(5, 2 * Math.ceil(30 / count) + 1);
}

export function wrap(index: number, count: number) {
  return ((index % count) + count) % count;
}

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
