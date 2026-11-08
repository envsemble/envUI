/*
 * Where an anatomy figure's callouts sit (AnatomyFigure.tsx): a numbered one on each part, on the
 * side it is nearest to, spread so none overlap; for a variants figure, each variant's name beside
 * its item, with the room the names take. The geometry is measured in AnatomyGeometry.ts and the
 * callouts placed from it in AnatomyPlacement.ts.
 */
import type { AnatomyLegendItem } from '../../../../scripts/docs/model/DocumentationTypes';
import {
  anatomyGeometry,
  labelWidths,
  sizesOfUses,
  spreadItems,
  variantGeometry,
} from './AnatomyGeometry';
import {
  fitsBeside,
  nameRoom,
  placeCallouts,
  spreadAbove,
  stackedItems,
  stackedVariants,
  roomsForUses,
  variantsInRow,
  type Callout,
  type Room,
} from './AnatomyPlacement';

/** Places a numbered callout on each part found in the subject (placeCallouts). */
export function measure(stage: HTMLElement, subject: HTMLElement, legend: AnatomyLegendItem[]) {
  return placeCallouts(anatomyGeometry(stage, subject, legend));
}

/**
 * Places each variant's name by the item it names: the item a legend item's part names, or else the
 * example's items in the legend's order. Items one under another take their names on the start
 * side, items side by side under them: plain text, with no line or outline, as a picture's labels
 * are. Returns the room the names need, which the subject keeps free.
 */
export function measureVariants(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
  /** The names' widths measured before, which the caller keeps until the fonts change. */
  labels: Map<string, number> = new Map(),
  /** What each legend item's variant is for, in lines, from the option table after the figure. */
  uses?: (string[] | undefined)[],
): { callouts: Callout[]; room: Room; beside?: boolean } {
  const geometry = variantGeometry(stage, subject, legend);
  const { items, elements } = geometry;
  if (!items.length) return { callouts: [], room: { start: 0, bottom: 0 } };
  const widths = labelWidths(
    stage,
    items.map(({ label }) => label),
    labels,
  );
  const sorted = stackedItems(items);
  if (!sorted) return variantsInRow(items, widths);
  const start = nameRoom(widths);
  // What each variant is for goes beside its item where every item has one and each fits there
  // (fitsBeside); where they don't, as in a narrow stage, each goes under its item.
  const lines = items.map(({ number }) => uses?.[number - 1]);
  const everyUse = lines.every((entry) => entry?.length);
  const rooms = roomsForUses(geometry, start);
  const sizes =
    rooms.beside !== null && everyUse
      ? sizesOfUses(stage, lines as string[][], rooms.beside, labels)
      : undefined;
  const beside = sizes && fitsBeside(sorted, items, sizes) ? sizes : undefined;
  const under =
    !beside && everyUse && rooms.under !== null
      ? sizesOfUses(stage, lines as string[][], rooms.under, labels)
      : undefined;
  spreadItems(
    sorted.map((item) => elements[items.indexOf(item)]!),
    spreadAbove(sorted, items, under),
  );
  return stackedVariants(geometry, sorted, start, lines, { beside, under, column: rooms.column });
}
