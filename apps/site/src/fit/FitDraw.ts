import { remPixels } from '../shared/Lengths';
import type { Fitting } from './useFit';
import { rowSlackPx } from './HeldView';
import { moving, pictures } from './PaintedBoxes';
import { pixelTolerance } from '../shared/Remeasure';

export interface Placement {
  scale: number;
  toX: number;
  toY: number;
  cut: string | undefined;
  fadeAt: number | null;
  played: boolean;
  screenTop?: boolean;
}

export function drawCut(
  f: Fitting,
  { cut, played, screenTop }: Pick<Placement, 'cut' | 'played' | 'screenTop'>,
) {
  const { canvas } = f;
  if (cut !== undefined) {
    if (cut) canvas.dataset.cut = cut;
    else delete canvas.dataset.cut;
  }
  if (screenTop) canvas.parentElement?.style.setProperty('--catalogue-crop-top', '0px');
  if (cut !== undefined) trim(f, played);
}

export function drawLayoutScale(
  canvas: HTMLElement,
  { heldSmaller, layoutScale }: { heldSmaller: boolean; layoutScale: string | null },
) {
  if (canvas.hasAttribute('data-held-scale') !== heldSmaller)
    canvas.toggleAttribute('data-held-scale', heldSmaller);
  if (
    layoutScale !== null &&
    canvas.style.getPropertyValue('--catalogue-canvas-scale') !== layoutScale
  )
    canvas.style.setProperty('--catalogue-canvas-scale', layoutScale);
}

export function drawScreenSize(f: Fitting, scale: number, tall: number) {
  const style = f.canvas.style;
  const size = (value: number) => `${Math.round(value * 100) / 100}px`;
  const across = size(f.stage.clientWidth / scale);
  if (style.inlineSize !== across) style.inlineSize = across;
  if (style.blockSize !== size(tall)) style.blockSize = size(tall);
  style.minBlockSize = '0px';
}

export const trim = (f: Fitting, played = false) =>
  trimRows(
    f.canvas,
    played,
    f.kept.fadeAt === null
      ? null
      : f.stage.clientHeight / 2 - f.view.y + f.kept.fadeAt * f.view.scale,
    f.kept.screen,
  );

export function place(f: Fitting) {
  const { canvas, view, kept } = f;
  const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
  if (canvas.style.transform !== transform) canvas.style.transform = transform;
  trim(f, kept.run !== null || (kept.screen && f.playing.current));
}

export const rowSelector = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'treeitem'].map(
    (role) => `[role='${role}']`,
  ),
  'li',
  'tr',
  '.env-time-list-row',
  '.env-pager-link',
  '.env-dialog-content > *',
  '.env-dialog-content .env-checkbox',
].join(', ');

export const cropFade = (crop: Element) =>
  parseFloat(getComputedStyle(crop).getPropertyValue('--catalogue-crop-fade')) * remPixels();

function trimRows(
  canvas: HTMLElement,
  played = false,
  fadeFrom: number | null = null,
  atScreenEdge = false,
) {
  const crop = canvas.parentElement;
  if (!crop?.classList.contains('catalogue-tile-crop')) return;
  if (!atScreenEdge && !canvas.dataset.cut?.split(' ').includes('bottom')) {
    for (const row of canvas.querySelectorAll<HTMLElement>('[data-catalogue-past]'))
      delete row.dataset.cataloguePast;
    crop.style.removeProperty('--catalogue-crop-bottom');
    return;
  }
  const { top, height } = crop.getBoundingClientRect();
  const { length, hides } = cropTrim(
    height,
    cropFade(crop),
    fadeFrom,
    atScreenEdge,
    played,
    remPixels(),
  );
  for (const row of canvas.querySelectorAll<HTMLElement>(rowSelector)) {
    const box = row.getBoundingClientRect();
    const hidden = !row.querySelector(rowSelector) && hides(box.top - top, box.bottom - top);
    if (hidden) row.dataset.cataloguePast = '';
    else if (hidden === false) delete row.dataset.cataloguePast;
  }
  if (atScreenEdge) crop.style.setProperty('--catalogue-crop-bottom', '0px');
  else if (fadeFrom === null) crop.style.removeProperty('--catalogue-crop-bottom');
  else crop.style.setProperty('--catalogue-crop-bottom', `${length}px`);
}

/** @internal */
export function cropTrim(
  height: number,
  fade: number,
  fadeFrom: number | null,
  atScreenEdge: boolean,
  played: boolean,
  rem: number,
) {
  const length = atScreenEdge
    ? 0
    : fadeFrom === null
      ? fade
      : Math.max(0, Math.min(fade, height - fadeFrom));
  const sliver = length < rem / 2 ? length + pixelTolerance : length / 2;
  const fadeShortened = !atScreenEdge && fadeFrom !== null && length < fade - pixelTolerance;
  const hides = (top: number, bottom: number) => {
    const belowShortenedFade = fadeShortened && top >= fadeFrom - rowSlackPx;
    if (
      bottom <= height + rowSlackPx ||
      !(atScreenEdge || belowShortenedFade || top > height - sliver)
    )
      return false;
    return !played || atScreenEdge || belowShortenedFade ? true : undefined;
  };
  return { length, hides };
}

const leastRunsOnHeightPx = 24;

export function markRunsOn(regions: Iterable<Element>) {
  for (const region of regions) {
    if (!(region instanceof HTMLElement)) continue;
    if (
      region.clientHeight < leastRunsOnHeightPx ||
      region.scrollHeight <= region.clientHeight + 1
    ) {
      delete region.dataset.catalogueRunsOn;
      continue;
    }
    const style = getComputedStyle(region);
    const ownFade = region.dataset.catalogueRunsOn === undefined && style.maskImage !== 'none';
    const runsOn =
      region.scrollTop + region.clientHeight < region.scrollHeight - 1 &&
      style.overflowY !== 'visible' &&
      !ownFade &&
      !moving(region) &&
      inkPastFoot(region);
    if (runsOn) region.dataset.catalogueRunsOn = '';
    else delete region.dataset.catalogueRunsOn;
  }
}

function inkPastFoot(region: HTMLElement) {
  const box = region.getBoundingClientRect();
  const ratio = box.height / region.offsetHeight || 1;
  const foot = box.top + (region.clientTop + region.clientHeight) * ratio + pixelTolerance * ratio;
  const walker = document.createTreeWalker(region, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Element) {
      if (pictures.test(node.localName) && node.getBoundingClientRect().bottom > foot) return true;
      continue;
    }
    if (!node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (range.getBoundingClientRect().bottom > foot) return true;
  }
  return false;
}
