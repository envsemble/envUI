/*
 * Where a picture is cut off (useFit.ts): the crop's fade at its foot, the rows hidden whole there,
 * and the regions that scroll as it plays, which fade at their own foot.
 */
import { remPixels } from '../shared/Lengths';
import { rowSlack } from './HeldView';
import { moving, pictures } from './PaintedBoxes';

/**
 * The rows of a list, a menu, a table, a tree or a picker's column, the cards of a pager, and the
 * parts of a dialog, such as its heading, a field, a checkbox or its actions: each drawn whole or
 * not at all at a crop's foot.
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

/** How long the crop's fade at its foot is, in px, as its style sets it (Tile.css). */
export const cropFade = (crop: Element) =>
  parseFloat(getComputedStyle(crop).getPropertyValue('--catalogue-crop-fade')) * remPixels();

/**
 * Where a picture is cut off at its foot, it fades out over the last stretch, as a drawer's list
 * does, through the rows it reaches past the foot with, rather than ending in a slice through one
 * (Tile.css). A row that would show no more than a sliver in the fade's faint end, or in a
 * fade too short to fade it out, is hidden whole. Where `fadeFrom` is given, px from the crop's
 * top, such as below a picker's chosen row, the fade starts no higher, so what is above it shows
 * whole. A row that holds others, such as a tree's branch, is left to its rows.
 */
export function trimRows(
  canvas: HTMLElement,
  played = false,
  fadeFrom: number | null = null,
  /** Whether the crop's foot is a screen's edge, which cuts off rather than fades (screenFit). */
  edge = false,
) {
  const crop = canvas.parentElement;
  if (!crop?.classList.contains('catalogue-tile-crop')) return;
  // A screen's edge cuts what reaches past it, also where a box in it clips that first, such as a
  // page's body as tall as the screen: there too a row shows whole or not at all.
  if (!edge && !canvas.dataset.cut?.split(' ').includes('bottom')) {
    for (const row of canvas.querySelectorAll<HTMLElement>('[data-catalogue-past]'))
      delete row.dataset.cataloguePast;
    crop.style.removeProperty('--catalogue-crop-bottom');
    return;
  }
  const { top, height } = crop.getBoundingClientRect();
  const fade = cropFade(crop);
  const length = edge
    ? 0
    : fadeFrom === null
      ? fade
      : Math.max(0, Math.min(fade, height - fadeFrom));
  // How far up from the foot a row's top shows no more than a sliver: in a fade's faint end, or
  // anywhere in a fade too short to fade a row out.
  const sliver = length < remPixels() / 2 ? length + 0.5 : length / 2;
  // A fade shortened below what a held view's script acts on is too short to fade a row out: a
  // row below it that reaches past the foot is hidden whole, so the window stops on a whole row
  // rather than on one cut through its glyphs, also as the tile plays, its view held.
  const short = !edge && fadeFrom !== null && length < fade - 0.5;
  for (const row of canvas.querySelectorAll<HTMLElement>(rowSelector)) {
    const box = row.getBoundingClientRect();
    // As a tile plays, its view drawn out for all it shows, a row it showed stays as the view
    // moves, cut off by the fade, rather than going and coming back. At a screen's edge, which
    // doesn't fade, a row shows whole or not at all.
    const below = short && box.top - top >= fadeFrom - rowSlack;
    if (
      !row.querySelector(rowSelector) &&
      box.bottom - top > height + rowSlack &&
      (edge || below || box.top - top > height - sliver)
    ) {
      if (!played || edge || below) row.dataset.cataloguePast = '';
    } else delete row.dataset.cataloguePast;
  }
  if (edge) crop.style.setProperty('--catalogue-crop-bottom', '0px');
  else if (fadeFrom === null) crop.style.removeProperty('--catalogue-crop-bottom');
  else crop.style.setProperty('--catalogue-crop-bottom', `${length}px`);
}

/**
 * Marks a region of a canvas that scrolls as it plays, such as a page's body in its box, while its
 * content runs on past its foot (`data-catalogue-runs-on`), so it fades out there (Tile.css),
 * as the crop does where the stage cuts a picture off, rather than ending in a slice through a
 * line. Only the foot, and only where text or a picture reaches past it, not the room under its
 * last line: what stays at its top, such as a sticky header, isn't cut. A region on its way open or
 * closed, such as a panel easing to its height, isn't one, nor one that fades its own edges.
 */
export function markRunsOn(regions: Iterable<Element>) {
  for (const region of regions) {
    if (!(region instanceof HTMLElement)) continue;
    if (region.clientHeight < 24 || region.scrollHeight <= region.clientHeight + 1) {
      delete region.dataset.catalogueRunsOn;
      continue;
    }
    const style = getComputedStyle(region);
    // A region that fades its own edges, such as a time picker's wheel, keeps its own fade.
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

/** Whether text or a picture in a region that scrolls reaches past its foot, where it is cut. */
function inkPastFoot(region: HTMLElement) {
  const box = region.getBoundingClientRect();
  const ratio = box.height / region.offsetHeight || 1;
  const foot = box.top + (region.clientTop + region.clientHeight) * ratio + 0.5 * ratio;
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
