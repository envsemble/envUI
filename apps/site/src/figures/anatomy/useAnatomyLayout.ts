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

const smallSubjectPx = { width: 240, height: 48 };
const mostEnlargedZoom = 1.5;
const zoomTolerance = 0.01;

function enlarge(subject: HTMLElement, always: boolean) {
  const exampleRoot = subject.firstElementChild;
  if (!(exampleRoot instanceof HTMLElement)) return;
  const current = Number(exampleRoot.style.getPropertyValue('zoom') || 1);
  const box = exampleRoot.getBoundingClientRect();
  const width = box.width / current;
  const height = box.height / current;
  const small =
    width > 0 && (always || (width <= smallSubjectPx.width && height <= smallSubjectPx.height));
  const zoom = small ? Math.max(1, Math.min(mostEnlargedZoom, subject.clientWidth / width)) : 1;
  if (Math.abs(zoom - current) < zoomTolerance) return;
  if (zoom === 1) exampleRoot.style.removeProperty('zoom');
  else exampleRoot.style.setProperty('zoom', zoom.toFixed(2));
}

interface LayoutOptions {
  legend: AnatomyLegendItem[];
  open: boolean;
  enlarged: boolean;
  variants: boolean;
  uses?: (string[] | undefined)[];
  onOrder: (order: number[], whole: number[]) => void;
  onBeside?: (beside: boolean) => void;
}

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
    const knownSizes = new Map<string, number>();
    const measure = (changed: ReadonlySet<Change>) => {
      if (changed.has('fonts')) knownSizes.clear();
      if (!open && !variants) enlarge(subjectElement, enlarged);
      const measured = variants
        ? { ...layOutVariants(stageElement, subjectElement, legend, knownSizes, uses), whole: [] }
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

function layOutCallouts(stage: HTMLElement, subject: HTMLElement, legend: AnatomyLegendItem[]) {
  return placeCallouts(measureParts(stage, subject, legend));
}

function layOutVariants(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
  knownSizes: Map<string, number> = new Map(),
  uses?: (string[] | undefined)[],
): { callouts: Callout[]; room: CalloutMargins; beside?: boolean } {
  const geometry = measureVariantItems(stage, subject, legend);
  const { items, elements } = geometry;
  if (!items.length) return { callouts: [], room: { start: 0, bottom: 0 } };
  const widths = labelWidths(
    stage,
    items.map(({ label }) => label),
    knownSizes,
  );
  const sorted = stackedItems(items);
  if (!sorted) return variantsInRow(items, widths);
  const start = nameRoom(widths);
  const lines = items.map(({ number }) => uses?.[number - 1]);
  const everyUse = lines.every((entry) => entry?.length);
  const rooms = roomsForUses(geometry, start);
  const sizes =
    rooms.beside !== null && everyUse
      ? sizesOfUses(stage, lines as string[][], rooms.beside, knownSizes)
      : undefined;
  const beside = sizes && fitsBeside(sorted, items, sizes) ? sizes : undefined;
  const under =
    !beside && everyUse && rooms.under !== null
      ? sizesOfUses(stage, lines as string[][], rooms.under, knownSizes)
      : undefined;
  spreadItems(
    sorted.map((item) => elements[items.indexOf(item)]!),
    spreadAbove(sorted, items, under),
  );
  return stackedVariants(geometry, sorted, start, lines, { beside, under, column: rooms.column });
}

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
