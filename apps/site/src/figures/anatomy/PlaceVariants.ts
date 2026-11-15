import { union, type Box } from '../../fit/FitGeometry';
import type { Callout, Side } from './PlaceCallouts';

export interface CalloutMargins {
  start: number;
  bottom: number;
  end?: number;
  under?: boolean;
}

const nameGapPx = 16;
const nameLineHeightPx = 20;

const mostUseWidthRem = 28;
const leastUseWidthRem = 12;
const useGapPx = 6;
const leastUnderWidthRem = 10;
const nameSpacingPx = 12;
const useClearancePx = 4;

export interface VariantItem {
  number: number;
  label: string;
  box: Box;
  added: number;
}

export interface VariantGeometry {
  width: number;
  inner: number;
  paddingStart: number;
  rem: number;
  rtl: boolean;
  items: VariantItem[];
}

export interface UseSize {
  width: number;
  height: number;
}

export function stackedItems(items: VariantItem[]) {
  const sorted = [...items].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1]!.box.bottom - 1,
  );
  return stacked ? sorted : null;
}

export function variantsInRow(items: VariantItem[], widths: number[]) {
  const outer = union(items.map(({ box }) => box));
  const order = items
    .map((_, index) => index)
    .sort((a, b) => items[a]!.box.left - items[b]!.box.left);
  const centres = order.map((index) => (items[index]!.box.left + items[index]!.box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank]!,
      centres[rank - 1]! + (widths[order[rank - 1]!]! + widths[order[rank]!]!) / 2 + nameSpacingPx,
    );
  const callouts: Callout[] = order.map((index, rank) => {
    const { number, label } = items[index]!;
    const point = { x: centres[rank]!, y: outer.bottom + nameGapPx / 2 };
    return { number, index: number - 1, label, side: 'bottom', badge: point, anchor: point };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, bottom: Math.ceil(nameLineHeightPx + nameGapPx / 2) },
  };
}

export const nameRoom = (widths: number[]) => Math.ceil(Math.max(...widths) + nameGapPx);

export function roomsForUses(geometry: VariantGeometry, start: number) {
  const { inner, rem, items } = geometry;
  const outer = union(items.map(({ box }) => box));
  const across = Math.floor(
    Math.min(mostUseWidthRem * rem, inner - start - (outer.right - outer.left) - nameGapPx),
  );
  const column = inner - start >= leastUnderWidthRem * rem;
  return {
    beside: across >= leastUseWidthRem * rem ? across : null,
    column,
    under:
      inner >= leastUnderWidthRem * rem
        ? Math.floor(Math.min(mostUseWidthRem * rem, column ? inner - start : inner))
        : null,
  };
}

export function fitsBeside(sorted: VariantItem[], items: VariantItem[], sizes: UseSize[]) {
  let shift = 0;
  const rows = sorted.map((item) => {
    shift += item.added;
    return {
      centre: (item.box.top + item.box.bottom) / 2 - shift,
      height: sizes[items.indexOf(item)]?.height ?? 0,
    };
  });
  return rows.every(
    (row, index) =>
      index === 0 ||
      row.centre - rows[index - 1]!.centre >=
        (row.height + rows[index - 1]!.height) / 2 + useClearancePx,
  );
}

export const spreadAbove = (sorted: VariantItem[], items: VariantItem[], under?: UseSize[]) =>
  sorted.map((item, rank) => {
    const before = rank > 0 && under?.[items.indexOf(sorted[rank - 1]!)];
    return before ? Math.ceil(before.height + 2 * useGapPx) : 0;
  });

export function stackedVariants(
  geometry: VariantGeometry,
  sorted: VariantItem[],
  start: number,
  lines: (string[] | undefined)[],
  uses: { beside?: UseSize[]; under?: UseSize[]; column: boolean },
): { callouts: Callout[]; room: CalloutMargins; beside: boolean } {
  const { items, rtl } = geometry;
  const { beside, under } = uses;
  const side: Side = rtl ? 'right' : 'left';
  const outer = union(items.map(({ box }) => box));
  const end = beside && Math.ceil(Math.max(...beside.map(({ width }) => width)) + nameGapPx);
  const innerStart = geometry.paddingStart + (uses.column ? start : 0);
  const callouts = items.map(({ number, box, label }, index): Callout => {
    const y = (box.top + box.bottom) / 2;
    const x = side === 'left' ? outer.left - nameGapPx : outer.right + nameGapPx;
    const use = beside
      ? {
          lines: lines[index]!,
          width: beside[index]!.width,
          x: side === 'left' ? outer.right + nameGapPx : outer.left - nameGapPx,
          y,
          side: side === 'left' ? ('right' as const) : ('left' as const),
        }
      : under
        ? {
            lines: lines[index]!,
            width: under[index]!.width,
            x: rtl ? geometry.width - innerStart : innerStart,
            y: box.bottom + useGapPx,
            side: 'bottom' as const,
          }
        : undefined;
    return { number, index: number - 1, label, side, badge: { x, y }, anchor: { x, y }, use };
  });
  const last = sorted.at(-1)!;
  return {
    callouts,
    room: under
      ? { start, bottom: Math.ceil(under[items.indexOf(last)]!.height + useGapPx), under: true }
      : { start, bottom: 0, end: beside ? end : 0 },
    beside: beside !== undefined || under !== undefined,
  };
}
