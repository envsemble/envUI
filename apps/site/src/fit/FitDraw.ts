/*
 * Writes a fit's decisions to the page (useFit.ts): the canvas's layout size and scale, the sides
 * it is cut off at (`data-cut`), its transform for the current view (place), and the crop's fade
 * at its bottom, hiding the rows that would show only a sliver there. It also marks regions that
 * scroll while a tile plays, so they fade at their own bottom. Moving the view is ViewEasing.ts's
 * job. This file writes the page, never what the fit keeps.
 */
import { remPixels } from '../shared/Lengths';
import type { Fitting } from './useFit';
import { rowSlack } from './HeldView';
import { moving, pictures } from './PaintedBoxes';
import { pixelTolerance } from '../shared/Remeasure';

/**
 * A decision on where a picture's view goes (FitResting.ts, FitScreen.ts):
 * - `scale`, `toX`, `toY`: the scale and the point at the stage's middle;
 * - `cut`: the sides it is cut off at (`data-cut`), or undefined to leave them as they are;
 * - `fadeAt`: where the crop's bottom fade starts, in the canvas's own px, or null for the
 *   default;
 * - `played`: whether the tile played, which changes how rows are trimmed (trimRows);
 * - `screenTop`: whether the top of a modal's screen is the stage's top edge.
 */
export interface Placement {
  scale: number;
  toX: number;
  toY: number;
  cut: string | undefined;
  fadeAt: number | null;
  played: boolean;
  screenTop?: boolean;
}

/**
 * Writes a decision's cut sides and trims the crop's rows (trim), before the view moves. The
 * caller sets `kept.fadeAt` first, since trim reads it.
 */
export function drawCut(
  f: Fitting,
  { cut, played, screenTop }: Pick<Placement, 'cut' | 'played' | 'screenTop'>,
) {
  const { canvas } = f;
  if (cut !== undefined) {
    if (cut) canvas.dataset.cut = cut;
    else delete canvas.dataset.cut;
  }
  // A modal's screen is cut off at the stage's top edge rather than faded there (trimRows).
  if (screenTop) canvas.parentElement?.style.setProperty('--catalogue-crop-top', '0px');
  if (cut !== undefined) trim(f, played);
}

/**
 * Writes the layout parts of a resting scale (decideRestingScale) before the view is placed:
 * `data-held-scale` when a held subject is drawn smaller, and on a phone the scale an open popup
 * lays out at (`--catalogue-canvas-scale`), which changes the canvas's layout.
 */
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

/**
 * Sizes a modal's canvas to the stage at `scale` (decideScreenScale): as wide as the stage and
 * `tall` canvas px high, which is at least the stage's height. The modal's backdrop then covers
 * the stage as it would cover a screen.
 */
export function drawScreenSize(f: Fitting, scale: number, tall: number) {
  const style = f.canvas.style;
  const size = (value: number) => `${Math.round(value * 100) / 100}px`;
  const across = size(f.stage.clientWidth / scale);
  if (style.inlineSize !== across) style.inlineSize = across;
  if (style.blockSize !== size(tall)) style.blockSize = size(tall);
  style.minBlockSize = '0px';
}

/**
 * Trims the crop's rows and sets its bottom fade (trimRows), with the fade starting no higher than
 * `kept.fadeAt`. A modal's screen (`kept.screen`) is cut off at the stage's edges instead of
 * fading.
 */
export const trim = (f: Fitting, played = false) =>
  trimRows(
    f.canvas,
    played,
    f.kept.fadeAt === null
      ? null
      : f.stage.clientHeight / 2 - f.view.y + f.kept.fadeAt * f.view.scale,
    f.kept.screen,
  );

/** Writes the canvas's transform for the current view, and trims the crop for it. */
export function place(f: Fitting) {
  const { canvas, view, kept } = f;
  const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
  if (canvas.style.transform !== transform) canvas.style.transform = transform;
  trim(f, kept.run !== null || (kept.screen && f.playing.current));
}

/**
 * The elements that are shown whole or not at all at a crop's bottom: rows of a list, menu, table,
 * tree or picker column, a pager's cards, and a dialog's parts (its heading, fields, checkboxes,
 * actions).
 */
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

/** The length, in px, of the crop's bottom fade, from `--catalogue-crop-fade` (TileStage.css). */
export const cropFade = (crop: Element) =>
  parseFloat(getComputedStyle(crop).getPropertyValue('--catalogue-crop-fade')) * remPixels();

/**
 * Fades a picture out at the crop's bottom, as a drawer's list does, instead of ending in a slice
 * through a row (TileStage.css). Rows (rowSelector) that reach past the bottom but would show only a
 * sliver, in the faint end of the fade or in a fade too short to fade them out, are hidden whole
 * (`data-catalogue-past`). A row that holds other rows, such as a tree's branch, is left to them.
 *
 * `fadeFrom`, in px from the crop's top, is the highest the fade may start, so what is above it,
 * such as a picker's chosen row, shows whole. `edge` means the crop's bottom is a modal screen's
 * edge: there is no fade, and every row that reaches past it is hidden. Without a `bottom` cut
 * (and without `edge`), nothing is trimmed.
 */
function trimRows(
  canvas: HTMLElement,
  played = false,
  fadeFrom: number | null = null,
  /** Whether the crop's bottom is a modal screen's edge, which cuts, not fades (FitScreen.ts). */
  edge = false,
) {
  const crop = canvas.parentElement;
  if (!crop?.classList.contains('catalogue-tile-crop')) return;
  // At a screen's edge, rows are trimmed even without a `bottom` cut, such as when a page's body
  // as tall as the screen clips them first: there too a row shows whole or not at all.
  if (!edge && !canvas.dataset.cut?.split(' ').includes('bottom')) {
    for (const row of canvas.querySelectorAll<HTMLElement>('[data-catalogue-past]'))
      delete row.dataset.cataloguePast;
    crop.style.removeProperty('--catalogue-crop-bottom');
    return;
  }
  const { top, height } = crop.getBoundingClientRect();
  const { length, hides } = cropTrim(height, cropFade(crop), fadeFrom, edge, played, remPixels());
  for (const row of canvas.querySelectorAll<HTMLElement>(rowSelector)) {
    const box = row.getBoundingClientRect();
    const hidden = !row.querySelector(rowSelector) && hides(box.top - top, box.bottom - top);
    if (hidden) row.dataset.cataloguePast = '';
    else if (hidden === false) delete row.dataset.cataloguePast;
  }
  if (edge) crop.style.setProperty('--catalogue-crop-bottom', '0px');
  else if (fadeFrom === null) crop.style.removeProperty('--catalogue-crop-bottom');
  else crop.style.setProperty('--catalogue-crop-bottom', `${length}px`);
}

/**
 * How a crop `height` px tall trims its rows (trimRows), with a fade `fade` px long and `rem` px
 * to a rem: the fade's `length`, and whether a row from `top` to `bottom`, in px from the crop's
 * top, is hidden whole (`hides`: true), shown (false), or keeps its current state (undefined).
 * @internal
 */
export function cropTrim(
  height: number,
  fade: number,
  fadeFrom: number | null,
  edge: boolean,
  played: boolean,
  rem: number,
) {
  const length = edge
    ? 0
    : fadeFrom === null
      ? fade
      : Math.max(0, Math.min(fade, height - fadeFrom));
  // How far above the bottom a row's top must be to show more than a sliver: half the fade, or
  // the whole fade when it is shorter than half a rem and too short to fade a row out.
  const sliver = length < rem / 2 ? length + pixelTolerance : length / 2;
  // A fade shortened by `fadeFrom` (below what a held view's script acts on) is too short to fade
  // a row out. A row below `fadeFrom` that reaches past the bottom is hidden, so the crop ends on a
  // whole row rather than one cut through its glyphs, also while the tile plays.
  const short = !edge && fadeFrom !== null && length < fade - pixelTolerance;
  const hides = (top: number, bottom: number) => {
    const below = short && top >= fadeFrom - rowSlack;
    if (bottom <= height + rowSlack || !(edge || below || top > height - sliver)) return false;
    // While a tile plays (`played`), a row past the bottom keeps its current state as the view
    // moves, rather than disappearing and coming back; only `edge` and `below` rows are newly
    // hidden.
    return !played || edge || below ? true : undefined;
  };
  return { length, hides };
}

/**
 * Marks each region that scrolls while a tile plays, such as a page's body in its box, with
 * `data-catalogue-runs-on` while text or a picture continues past its bottom. The mark fades the
 * region's bottom (TileStage.css), as the crop fades a cut picture, instead of ending in a slice through
 * a line. Only the bottom fades, so a sticky header at the top is not cut. Not marked: regions
 * shorter than 24 px, regions that do not scroll, regions still opening or closing (moving), and
 * regions that already fade their own edges, such as a time picker's wheel.
 */
export function markRunsOn(regions: Iterable<Element>) {
  for (const region of regions) {
    if (!(region instanceof HTMLElement)) continue;
    if (region.clientHeight < 24 || region.scrollHeight <= region.clientHeight + 1) {
      delete region.dataset.catalogueRunsOn;
      continue;
    }
    const style = getComputedStyle(region);
    // A mask-image the site did not set means the region fades its own edges.
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

/** Whether any text or picture element in a scrolling region reaches past its visible bottom. */
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
