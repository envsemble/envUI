/*
 * What a picture paints, measured in its canvas's own px (FitMeasure.ts): what is centred is what
 * shows, rather than the boxes that lay it out.
 */
import { paintsOf } from '@envui-internal/dev/measure';
import type { Box } from './FitGeometry';

/** The layer a picture's popups open in (StageOverlays, motion/Playback.tsx). */
export const overlayLayer = '.catalogue-overlay-layer';

/** Whether an element is in a picture's overlay layer, a popup. */
export const inPopup = (element: Element) => element.closest(overlayLayer) !== null;

/**
 * The elements of a canvas a selector names, such as one a tile names for its view to keep
 * (StageScript, FitKind.ts); a selector that doesn't parse names none.
 */
export function elementsOf(canvas: Element, selector: string) {
  try {
    return [...canvas.querySelectorAll(selector)];
  } catch {
    return [];
  }
}

/**
 * Whether an element is clipped away whole, as a visually hidden one is (`clip-path: inset(50%)`),
 * such as a notification region's announcer, which only a screen reader reads.
 */
const clippedAway = (style: CSSStyleDeclaration) => /^inset\((50|100)%/.test(style.clipPath);

/** Whether an element is coming or going: starting its entrance, or in a transition or animation. */
export const moving = (element: Element) =>
  element.closest('[data-starting-style], [data-ending-style]') !== null ||
  (element.getAnimations?.().length ?? 0) > 0;

/**
 * Whether an element is on its way somewhere: it or a box around it, inside the canvas, starting or
 * ending its entrance, or in a transition or an animation that ends, unlike a spinner's.
 */
export function settling(element: Element, canvas: Element) {
  if (element.closest('[data-starting-style], [data-ending-style]')) return true;
  for (let node: Element | null = element; node && node !== canvas; node = node.parentElement) {
    const ends = (node.getAnimations?.() ?? []).some(
      (animation) =>
        animation.playState === 'running' &&
        animation.effect?.getComputedTiming().iterations !== Infinity,
    );
    if (ends) return true;
  }
  return false;
}

/** Elements that are their own picture, whatever their style. */
export const pictures = /^(img|svg|canvas|video|input|textarea|select|hr)$/i;

/**
 * Whether an element paints something of its own: a fill, an image, an edge or a shadow, as dev
 * mode counts them (paintsOf), text, or a picture such as an icon. A box that only lays out
 * others, such as an avatar group's row, which keeps the room its avatars spread into, paints
 * nothing, so what it holds is measured instead.
 */
function paints(element: Element, style: CSSStyleDeclaration) {
  if (pictures.test(element.localName) || paintsOf(style).length) return true;
  return [...element.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
}

/** The part of a box inside a clip, empty where none is, or the box where nothing clips it. */
function within(box: DOMRect, clip: DOMRect | null) {
  if (!clip) return box;
  const left = Math.max(box.left, clip.left);
  const top = Math.max(box.top, clip.top);
  const right = Math.min(box.right, clip.right);
  const bottom = Math.min(box.bottom, clip.bottom);
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

/** A box a picture paints, and its element (shownBoxes). */
export interface Shown {
  element: Element;
  box: DOMRect;
}

/**
 * The boxes a picture paints, in the canvas's own px (paints), so what is centred is what shows
 * rather than the boxes that lay it out. A backdrop or a positioner over the whole canvas, such as
 * a dialog's, counts only for what it holds; what is hidden, transparent or a visually hidden pixel
 * doesn't count.
 */
export function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: Shown[] = [];
  // What a box that clips its content, such as a scrolling list, holds outside it doesn't show:
  // each box counts as far as the boxes around it that clip show it.
  const visit = (element: Element, clip: DOMRect | null) => {
    for (const child of element.children) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || clippedAway(style)) continue;
      // What is transparent doesn't show, unless it is on its way in or out, such as a popup
      // starting its entrance: the view is placed for it, rather than without it and back.
      if (style.opacity === '0' && !moving(child)) continue;
      // A row hidden past the crop's foot (trimRows) still counts, so hiding it moves nothing.
      if (style.visibility === 'hidden' && !child.closest('[data-catalogue-past]')) continue;
      const rect = child.getBoundingClientRect();
      const box = within(
        new DOMRect(
          (rect.left - frame.left) / scale,
          (rect.top - frame.top) / scale,
          rect.width / scale,
          rect.height / scale,
        ),
        clip,
      );
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        /absolute|fixed/.test(style.position);
      // A hairline counts, such as a toolbar's separator a px wide, whatever the scale rounds it to.
      if (box.width > 0.5 && box.height > 0.5 && !covers && paints(child, style))
        found.push({ element: child, box });
      // Text counts as far as it runs, also past a box narrower than it, such as a heatmap's
      // month names over columns of no width.
      for (const node of child.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const drawn = range.getBoundingClientRect();
        const text = within(
          new DOMRect(
            (drawn.left - frame.left) / scale,
            (drawn.top - frame.top) / scale,
            drawn.width / scale,
            drawn.height / scale,
          ),
          clip,
        );
        if (text.width > 1 && text.height > 1) found.push({ element: child, box: text });
      }
      // A picture's parts are the picture; anything else may hold more that shows.
      const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
      if (!pictures.test(child.localName)) visit(child, clips ? box : clip);
    }
  };
  visit(canvas, null);
  return found;
}

/**
 * What shows of an element, in its canvas's own px, inside the boxes around it that clip it, such
 * as a scrolling column's: a row scrolled out of it doesn't count.
 */
export function partOf(element: Element, canvas: HTMLElement): Box {
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const ownBox = (node: Element): Box => {
    const rect = node.getBoundingClientRect();
    return {
      left: (rect.left - frame.left) / ratio,
      top: (rect.top - frame.top) / ratio,
      right: (rect.right - frame.left) / ratio,
      bottom: (rect.bottom - frame.top) / ratio,
    };
  };
  let box = ownBox(element);
  for (let node = element.parentElement; node && node !== canvas; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    const clip = ownBox(node);
    box = {
      left: Math.max(box.left, clip.left),
      top: Math.max(box.top, clip.top),
      right: Math.min(box.right, clip.right),
      bottom: Math.min(box.bottom, clip.bottom),
    };
  }
  return box;
}

/**
 * Where an element is laid out, in its canvas's own px, without the transforms that move it from
 * there, such as a pile's avatar gathered toward its start from its place in the spread row; for an
 * element that nothing moves, none: it counts as far as it paints (shownBoxes).
 */
export function laidOutOf(element: Element, canvas: HTMLElement): Box | null {
  if (!(element instanceof HTMLElement)) return null;
  const holder = element.offsetParent;
  const style = getComputedStyle(element);
  const moved = [style.transform, style.translate, style.rotate, style.scale].some(
    (value) => value !== 'none',
  );
  if (!moved || !(holder instanceof HTMLElement) || !canvas.contains(holder)) return null;
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const around = holder.getBoundingClientRect();
  const left = (around.left - frame.left) / ratio + holder.clientLeft - holder.scrollLeft;
  const top = (around.top - frame.top) / ratio + holder.clientTop - holder.scrollTop;
  return {
    left: left + element.offsetLeft,
    top: top + element.offsetTop,
    right: left + element.offsetLeft + element.offsetWidth,
    bottom: top + element.offsetTop + element.offsetHeight,
  };
}

/**
 * What shows of an element as far as it paints, in its canvas's own px: of one that holds text,
 * such as a heading as wide as its pane, the text's own extent, not its box's.
 */
export function inkOf(element: Element, canvas: HTMLElement): Box {
  const box = partOf(element, canvas);
  if (!element.textContent?.trim()) return box;
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  return {
    left: Math.max(box.left, (text.left - frame.left) / ratio),
    top: Math.max(box.top, (text.top - frame.top) / ratio),
    right: Math.min(box.right, (text.right - frame.left) / ratio),
    bottom: Math.min(box.bottom, (text.bottom - frame.top) / ratio),
  };
}

/**
 * The two rows after the one an element is chosen in, of a picker's grid or wheel, in its canvas's
 * own px, as far as there are.
 */
export function rowsAfter(element: Element, canvas: HTMLElement): Box[] {
  const rows: Box[] = [];
  let row = element.closest('tr, .env-time-list-row')?.nextElementSibling;
  while (row && rows.length < 2 && canvas.contains(row) && row.checkVisibility()) {
    rows.push(partOf(row, canvas));
    row = row.nextElementSibling;
  }
  return rows;
}
