import type { RibbonFrame } from './RibbonScene';

type TemporaryPhoneRibbon = 'a' | 'b';

const phoneQuery = '(width < 40rem)';
const chosenByDefault: TemporaryPhoneRibbon = 'a';
const sweepLargestUnitPx = 330;
const textClearancePx = 8;
const factsSelector = '.catalogue-overview-facts';
const unsurfacedTextSelector = `${factsSelector}, .catalogue-overview-widget-samples .env-segmented-control-item-label`;

const sweepLegLeftByDepth: [number, number][] = [
  [0.13, -0.455],
  [0.31, -0.445],
  [0.4, -0.43],
  [0.49, -0.409],
  [0.58, -0.37],
  [0.67, -0.358],
];
const arcTopHeightByX: [number, number][] = [
  [-1.264, 0.183],
  [-1.081, 0.282],
  [-0.897, 0.359],
  [-0.714, 0.414],
  [-0.531, 0.447],
  [-0.348, 0.465],
];

export function temporaryPhoneRibbon(): TemporaryPhoneRibbon | null {
  if (typeof window === 'undefined' || !window.matchMedia(phoneQuery).matches) return null;
  const asked = new URLSearchParams(window.location.search).get('rb');
  return asked === 'a' || asked === 'b' ? asked : chosenByDefault;
}

function interpolate(table: [number, number][], at: number) {
  if (at <= table[0]![0]) return table[0]![1];
  for (let i = 1; i < table.length; i++) {
    const [a1, v1] = table[i]!;
    const [a0, v0] = table[i - 1]!;
    if (at <= a1) return v0 + ((v1 - v0) * (at - a0)) / (a1 - a0);
  }
  return table[table.length - 1]![1];
}

function sweepFrame(box: HTMLElement, outer: DOMRect, widgetTop: number): RibbonFrame {
  const unit = Math.min(0.85 * outer.width, sweepLargestUnitPx);
  const cornerY = Math.max(widgetTop - 0.5 * unit, 0.255 * unit);
  let cornerX = 0;
  for (const text of box.parentElement?.querySelectorAll(unsurfacedTextSelector) ?? []) {
    const rect = text.getBoundingClientRect();
    const depth = (rect.bottom - outer.top - cornerY) / unit;
    const clear = rect.right - outer.left + textClearancePx;
    cornerX = Math.max(cornerX, clear - interpolate(sweepLegLeftByDepth, depth) * unit);
  }
  return {
    width: outer.width,
    height: outer.height,
    cornerX,
    cornerY,
    unit,
    placed: true,
    roll: 1.5,
  };
}

function arcFrame(box: HTMLElement, outer: DOMRect, widget: DOMRect): RibbonFrame {
  const unit = 0.7 * outer.width;
  const cornerX = widget.right - outer.left - 0.12 * unit;
  let cornerY = widget.top - outer.top - 0.25 * unit;
  const facts = box.parentElement?.querySelector(factsSelector)?.getBoundingClientRect();
  if (facts) {
    const reach = (facts.right - outer.left + textClearancePx - cornerX) / unit;
    const clear = facts.bottom - outer.top + textClearancePx;
    cornerY = Math.max(cornerY, clear + interpolate(arcTopHeightByX, reach) * unit);
  }
  return {
    width: outer.width,
    height: outer.height,
    cornerX,
    cornerY,
    unit,
    placed: true,
    roll: -0.2,
  };
}

export function temporaryPhoneFrame(
  variant: TemporaryPhoneRibbon,
  box: HTMLElement,
  widget: DOMRect,
): RibbonFrame {
  const outer = box.getBoundingClientRect();
  return variant === 'a'
    ? sweepFrame(box, outer, widget.top - outer.top)
    : arcFrame(box, outer, widget);
}
