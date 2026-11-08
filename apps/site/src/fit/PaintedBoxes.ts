/*
 * Measures what a picture paints, in its canvas's own px (FitMeasure.ts). The fit centres what
 * shows, not the boxes that only lay it out, so it needs to know which boxes paint something.
 */
import { paintsOf } from '@envui-internal/internal/dom/paints';
import type { Box } from './FitGeometry';
import { pixelTolerance } from '../shared/Remeasure';

/** The layer a picture's popups open in (StageOverlays, motion/Playback.tsx). */
export const overlayLayer = '.catalogue-overlay-layer';

/** Whether an element is in a picture's overlay layer, that is, part of a popup. */
export const inPopup = (element: Element) => element.closest(overlayLayer) !== null;

/**
 * The elements of a canvas that match a selector, such as one a tile's script names
 * (StageScript, FitKind.ts). An invalid selector matches nothing instead of throwing.
 */
export function elementsOf(canvas: Element, selector: string) {
  try {
    return [...canvas.querySelectorAll(selector)];
  } catch {
    return [];
  }
}

/**
 * Whether an element is clipped away entirely, as a visually hidden element is
 * (`clip-path: inset(50%)`). Example: a notification region's announcer, which only a screen
 * reader reads.
 */
const clippedAway = (style: CSSStyleDeclaration) => /^inset\((50|100)%/.test(style.clipPath);

/** Whether an element is entering or leaving, or has any running animation or transition. */
export const moving = (element: Element) =>
  element.closest('[data-starting-style], [data-ending-style]') !== null ||
  (element.getAnimations?.().length ?? 0) > 0;

/**
 * Whether an element is still moving to where it will rest: it is entering or leaving, or it or an
 * ancestor inside the canvas runs an animation or transition that ends. Endless animations, such
 * as a spinner's, do not count.
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

/** Elements that always paint something, whatever their style. */
export const pictures = /^(img|svg|canvas|video|input|textarea|select|hr)$/i;

/**
 * Whether an element paints something of its own: a fill, an image, an edge or a shadow (counted
 * as dev mode's paintsOf counts them), its own text, or a picture such as an icon. A box that only
 * lays out others paints nothing, so its children are measured instead. Example: an avatar
 * group's row, which is as wide as the avatars spread out.
 */
function paints(element: Element, style: CSSStyleDeclaration) {
  if (pictures.test(element.localName) || paintsOf(style).length) return true;
  return [...element.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
}

/** The part of `box` inside `clip`: empty when they do not overlap, `box` itself when no clip. */
function within(box: DOMRect, clip: DOMRect | null) {
  if (!clip) return box;
  const left = Math.max(box.left, clip.left);
  const top = Math.max(box.top, clip.top);
  const right = Math.min(box.right, clip.right);
  const bottom = Math.min(box.bottom, clip.bottom);
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

/** A box a picture paints, in its canvas's own px, and its element (shownBoxes). */
export interface Shown {
  element: Element;
  box: DOMRect;
}

/**
 * The boxes a picture paints (paints), in the canvas's own px. Skipped: elements that are hidden,
 * transparent or visually hidden, and a backdrop or positioner that covers the whole canvas, such
 * as a dialog's, whose children are measured instead.
 */
export function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: Shown[] = [];
  // Content outside a box that clips it, such as a scrolling list, does not show: each box is
  // cut to the clipping boxes around it.
  const visit = (element: Element, clip: DOMRect | null) => {
    for (const child of element.children) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || clippedAway(style)) continue;
      // A transparent element does not show, unless it is entering or leaving, such as a popup
      // at the start of its entrance. Counting it then places the view for it at once, rather
      // than without it and then back.
      if (style.opacity === '0' && !moving(child)) continue;
      // A row hidden past the crop's bottom (trimRows) still counts, so hiding it moves nothing.
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
      // A hairline, such as a toolbar's 1 px separator, counts at any scale.
      if (
        box.width > pixelTolerance &&
        box.height > pixelTolerance &&
        !covers &&
        paints(child, style)
      )
        found.push({ element: child, box });
      // Text counts by its own extent, also where it overflows a narrower box, such as a
      // heatmap's month names over columns of no width.
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
      // A picture element (pictures) is measured whole; any other element's children are
      // visited too.
      const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
      if (!pictures.test(child.localName)) visit(child, clips ? box : clip);
    }
  };
  visit(canvas, null);
  return found;
}

/**
 * The visible part of an element, in its canvas's own px: its box cut to every ancestor inside
 * the canvas that clips it, such as a scrolling column. A row scrolled out of view comes out empty.
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
 * Where an element is laid out, in its canvas's own px, ignoring the transforms that move it.
 * Example: a pile's avatar moved toward the start from its place in the spread-out row. Returns
 * null for an element with no transform, which shownBoxes already measures where it paints.
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
 * The visible part of an element (partOf), narrowed to its text's extent when it holds text.
 * Example: a heading as wide as its pane counts only as wide as its words.
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
 * The visible boxes, in the canvas's own px, of up to two rows after the row that holds an
 * element, in a picker's grid (`tr`) or wheel (`.env-time-list-row`).
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
