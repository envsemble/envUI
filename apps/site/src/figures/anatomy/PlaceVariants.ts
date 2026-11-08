/*
 * Where a variants figure's labels are placed (useAnatomyLayout.ts), from what is measured of its
 * items (MeasureAnatomy.ts). Each variant's name goes beside its item. Items side by side get their
 * names under them. Items stacked one under another get their names on the start side, and the
 * text that says what each variant is for goes beside the item on the other side, or under it when
 * there is no room beside. Nothing here reads the page (tests/site/PlaceVariants.test.mjs).
 */
import { union, type Box } from '../../fit/FitGeometry';
import type { Callout, Side } from './PlaceCallouts';

/** The room, in px, a variants figure's names take beside its items: on the start side or above. */
export interface CalloutMargins {
  start: number;
  bottom: number;
  end?: number;
  /** In a variants figure, whether what each variant is for sits under its item. */
  under?: boolean;
}

/** How far a variant's name stands off its item, in px, and the height of its line of text. */
const nameGap = 16;
const nameHeight = 20;

/** The most and the least room, in rem, what a variant is for takes beside its item. */
const useMeasure = 28;
const useLeast = 12;
/** How far what a variant is for stands under its item, and off the next, in px. */
const useGap = 6;
/** The least room, in rem, what a variant is for takes under its item. */
const underLeast = 10;

/** One item of a variants figure, as measured (measureVariantItems). */
export interface VariantItem {
  /** Its legend item's number, from 1, and the variant's name. */
  number: number;
  label: string;
  box: Box;
  /**
   * The room an earlier measure set above it for what the item before it is for, under that one
   * (`data-catalogue-spread`), in px.
   */
  added: number;
}

/** A variants figure's subject as measured (measureVariantItems). */
export interface VariantGeometry {
  /** The stage's width, the room inside its padding, and its padding on the start side. */
  width: number;
  inner: number;
  paddingStart: number;
  /** The px in a rem, and whether the stage reads right to left. */
  rem: number;
  rtl: boolean;
  items: VariantItem[];
}

/** The size, in px, of what a variant is for, wrapped at the room it is given. */
export interface UseSize {
  width: number;
  height: number;
}

/** A variants figure's items in order down the stage, where they stand one under another. */
export function stackedItems(items: VariantItem[]) {
  // One under another where no two items share a line.
  const sorted = [...items].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1]!.box.bottom - 1,
  );
  return stacked ? sorted : null;
}

/**
 * Items side by side take their names under them, spread so that none overlaps the next, `widths`
 * being their names' widths.
 */
export function variantsInRow(items: VariantItem[], widths: number[]) {
  const outer = union(items.map(({ box }) => box));
  const order = items
    .map((_, index) => index)
    .sort((a, b) => items[a]!.box.left - items[b]!.box.left);
  const centres = order.map((index) => (items[index]!.box.left + items[index]!.box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank]!,
      centres[rank - 1]! + (widths[order[rank - 1]!]! + widths[order[rank]!]!) / 2 + 12,
    );
  const callouts: Callout[] = order.map((index, rank) => {
    const { number, label } = items[index]!;
    const point = { x: centres[rank]!, y: outer.bottom + nameGap / 2 };
    return { number, index: number - 1, label, side: 'bottom', badge: point, anchor: point };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, bottom: Math.ceil(nameHeight + nameGap / 2) },
  };
}

/** The room the variants' names take on the start side, by their widths. */
export const nameRoom = (widths: number[]) => Math.ceil(Math.max(...widths) + nameGap);

/**
 * Where items stand one under another, their names take `start` on the start side. What each
 * variant is for goes beside its item on the other side, in the room left there, at most a readable
 * measure: none where that is less than `useLeast`. Else it goes under its item, under the items'
 * column (`column`) where that has the room and else from the names' start: none where the stage
 * has less than `underLeast`.
 */
export function roomsForUses(geometry: VariantGeometry, start: number) {
  const { inner, rem, items } = geometry;
  const outer = union(items.map(({ box }) => box));
  const across = Math.floor(
    Math.min(useMeasure * rem, inner - start - (outer.right - outer.left) - nameGap),
  );
  const column = inner - start >= underLeast * rem;
  return {
    beside: across >= useLeast * rem ? across : null,
    column,
    under:
      inner >= underLeast * rem
        ? Math.floor(Math.min(useMeasure * rem, column ? inner - start : inner))
        : null,
  };
}

/**
 * Whether what each variant is for, at its size, fits beside its item: each centred on its item's
 * line, clear of the next one's. The room an earlier measure set above an item is left out, so the
 * choice is made on the items' own spacing and never flips.
 */
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
      row.centre - rows[index - 1]!.centre >= (row.height + rows[index - 1]!.height) / 2 + 4,
  );
}

/**
 * The room, in px, each item in order down the stage stands further from the one before, so what
 * that one is for shows under it: none where those don't go under their items.
 */
export const spreadAbove = (sorted: VariantItem[], items: VariantItem[], under?: UseSize[]) =>
  sorted.map((item, rank) => {
    const before = rank > 0 && under?.[items.indexOf(sorted[rank - 1]!)];
    return before ? Math.ceil(before.height + 2 * useGap) : 0;
  });

/**
 * Places each variant's name beside its item, on the start side, and what each is for beside it on
 * the other side (`beside`) or under it (`under`), as decided; returns the room they take.
 */
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
  const end = beside && Math.ceil(Math.max(...beside.map(({ width }) => width)) + nameGap);
  const innerStart = geometry.paddingStart + (uses.column ? start : 0);
  const callouts = items.map(({ number, box, label }, index): Callout => {
    const y = (box.top + box.bottom) / 2;
    const x = side === 'left' ? outer.left - nameGap : outer.right + nameGap;
    const use = beside
      ? {
          lines: lines[index]!,
          width: beside[index]!.width,
          x: side === 'left' ? outer.right + nameGap : outer.left - nameGap,
          y,
          side: side === 'left' ? ('right' as const) : ('left' as const),
        }
      : under
        ? {
            lines: lines[index]!,
            width: under[index]!.width,
            x: rtl ? geometry.width - innerStart : innerStart,
            y: box.bottom + useGap,
            side: 'bottom' as const,
          }
        : undefined;
    return { number, index: number - 1, label, side, badge: { x, y }, anchor: { x, y }, use };
  });
  const last = sorted.at(-1)!;
  return {
    callouts,
    room: under
      ? { start, bottom: Math.ceil(under[items.indexOf(last)]!.height + useGap), under: true }
      : { start, bottom: 0, end: beside ? end : 0 },
    beside: beside !== undefined || under !== undefined,
  };
}
