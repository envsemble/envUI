/*
 * Lays out an anatomy figure's callouts, again whenever the figure changes (AnatomyFigure.tsx).
 * It measures what the subject shows (MeasureAnatomy.ts) and places the callouts from that: a
 * numbered callout on each part (PlaceCallouts.ts), or, for a variants figure, each variant's name
 * beside its item (PlaceVariants.ts). It also sets the room the names take, and moves the items
 * apart to make room for the text under each one (spreadItems).
 */
import { useLayoutEffect, useState, type RefObject } from 'react';
import type { AnatomyLegendItem } from '../../documentation/DocumentationTypes';
import { remeasure, type Change } from '../../shared/Remeasure';
import { labelWidths, measureParts, measureVariantItems, sizesOfUses } from './MeasureAnatomy';
import { placeCallouts, type Callout } from './PlaceCallouts';
import {
  fitsBeside,
  nameRoom,
  spreadAbove,
  stackedItems,
  stackedVariants,
  roomsForUses,
  variantsInRow,
  type CalloutMargins,
} from './PlaceVariants';

/** A subject at most this wide and tall, in CSS pixels, is small enough to show larger. */
const smallSubject = { width: 240, height: 48 };

/**
 * Shows a small subject, such as a badge or a checkbox, half as large again, as far as its stage
 * has room, so the callouts on its parts don't crowd; so too any subject its fence marks `enlarge`,
 * whose parts sit close together, such as a bar's item. The callouts measure the enlarged parts.
 */
function enlarge(subject: HTMLElement, always: boolean) {
  // The example's root, which sizes to its content when it is small.
  const scaled = subject.firstElementChild;
  if (!(scaled instanceof HTMLElement)) return;
  const current = Number(scaled.style.getPropertyValue('zoom') || 1);
  const box = scaled.getBoundingClientRect();
  const width = box.width / current;
  const height = box.height / current;
  const small =
    width > 0 && (always || (width <= smallSubject.width && height <= smallSubject.height));
  const zoom = small ? Math.max(1, Math.min(1.5, subject.clientWidth / width)) : 1;
  if (Math.abs(zoom - current) < 0.01) return;
  if (zoom === 1) scaled.style.removeProperty('zoom');
  else scaled.style.setProperty('zoom', zoom.toFixed(2));
}

/** What an anatomy figure's callouts are laid out for (useAnatomyLayout), as AnatomyStage takes it. */
interface LayoutOptions {
  legend: AnatomyLegendItem[];
  open: boolean;
  enlarged: boolean;
  variants: boolean;
  uses?: (string[] | undefined)[];
  onOrder: (order: number[], whole: number[]) => void;
  onBeside?: (beside: boolean) => void;
}

/**
 * The callouts of an anatomy figure, measured from its live parts, and in a variants figure the
 * room its names take, following the figure until it goes or changes (remeasure). Only a change of
 * place re-renders them.
 */
export function useAnatomyLayout(
  stage: RefObject<HTMLDivElement | null>,
  subject: RefObject<HTMLDivElement | null>,
  { legend, open, enlarged, variants, uses, onOrder, onBeside }: LayoutOptions,
) {
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [room, setRoom] = useState<CalloutMargins>({ start: 0, bottom: 0 });
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    /** The variants' names' widths, measured once, and again as the fonts arrive. */
    const labels = new Map<string, number>();
    const measure = (changed: ReadonlySet<Change>) => {
      if (changed.has('fonts')) labels.clear();
      // Open overlays take the room they need; they are never small.
      if (!open && !variants) enlarge(subjectElement, enlarged);
      const measured = variants
        ? { ...layOutVariants(stageElement, subjectElement, legend, labels, uses), whole: [] }
        : { ...layOutCallouts(stageElement, subjectElement, legend), room: undefined };
      const next = measured.callouts;
      setCallouts((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      if (!variants)
        onOrder(
          next.map(({ index }) => index),
          measured.whole,
        );
      if (variants) onBeside?.('beside' in measured && Boolean(measured.beside));
      const needed = measured.room;
      if (needed)
        setRoom((current) =>
          current.start === needed.start &&
          current.bottom === needed.bottom &&
          current.end === needed.end &&
          current.under === needed.under
            ? current
            : needed,
        );
    };
    // The callouts follow the figure as it resizes, its example loads and its fonts arrive, and as
    // its parts settle where they enter with motion, such as a dock's panel rising into place,
    // which moves them without resizing them.
    const layout = remeasure(measure, {
      first: 'frame',
      resize: [stageElement, subjectElement],
      mutation: {
        target: subjectElement,
        options: { childList: true, subtree: true, attributeFilter: ['class', 'style'] },
      },
      events: [{ target: subjectElement, types: ['animationend', 'transitionend'] }],
      fonts: true,
    });
    return layout.stop;
  }, [stage, subject, legend, open, enlarged, variants, onOrder, uses, onBeside]);
  return { callouts, room };
}

/** Places a numbered callout on each part found in the subject (placeCallouts). */
function layOutCallouts(stage: HTMLElement, subject: HTMLElement, legend: AnatomyLegendItem[]) {
  return placeCallouts(measureParts(stage, subject, legend));
}

/**
 * Places each variant's name by the item it names: the item a legend item's part names, or else the
 * example's items in the legend's order. Items one under another take their names on the start
 * side, items side by side under them: plain text, with no line or outline, as a picture's labels
 * are. Returns the room the names need, which the subject keeps free.
 */
function layOutVariants(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
  /** The names' widths measured before, which the caller keeps until the fonts change. */
  labels: Map<string, number> = new Map(),
  /** What each legend item's variant is for, in lines, from the option table after the figure. */
  uses?: (string[] | undefined)[],
): { callouts: Callout[]; room: CalloutMargins; beside?: boolean } {
  const geometry = measureVariantItems(stage, subject, legend);
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

/**
 * Stands each item that much further from the one before (`data-catalogue-spread`), so what that
 * one is for shows under it, by its item, rather than again in a legend under the figure.
 */
function spreadItems(elements: Element[], room: number[]) {
  elements.forEach((element, index) => {
    if (!(element instanceof HTMLElement)) return;
    const margin = room[index] ? `${room[index]}px` : '';
    if (margin) {
      if (element.style.marginBlockStart !== margin) element.style.marginBlockStart = margin;
      if (!element.hasAttribute('data-catalogue-spread'))
        element.setAttribute('data-catalogue-spread', '');
    } else if (element.hasAttribute('data-catalogue-spread')) {
      element.style.marginBlockStart = '';
      element.removeAttribute('data-catalogue-spread');
    }
  });
}
