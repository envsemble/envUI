/*
 * What the virtual pointer is over (VirtualPointer.ts): the element at a point of its stage, as the
 * browser's own hit test finds it, and the elements around that element. The pointer's controllers
 * share this.
 */

/** A point of the pointer's, in viewport coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** A point a move goes to, and the element under it, found before the move (VirtualPointer.aim). */
export interface Aimed {
  point: Point;
  target: Element;
}

/** The flags of the held modifier keys, which every event the pointer sends carries. */
export interface Modifiers {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Where a pointer is over its stage, shared by its controllers and kept by its VirtualPointer: its
 * stage, `scope`, the point it is at, and the elements it is over, innermost first.
 */
export interface PointerSpot {
  readonly scope: Element;
  at: Point | null;
  over: Element[];
  /** The flags of the modifier keys held now (KeyboardControl.ts). */
  readonly modifiers: Modifiers;
  /** Moves the pointer to a point, as a move in its script does (VirtualPointer.moveTo). */
  moveTo(point: Point): void;
  /** Records where the stage is, as the pointer moves over it. */
  noteScope(): void;
  /** Draws its cursor where it is, pressed or not, carrying files or not. */
  drawCursor(): void;
}

/** Fields a press focuses, so that typing goes into them. */
export const textFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"]), textarea, [contenteditable="true"]';

/**
 * A layer over a whole stage, which the pointer is never over: it only holds the stage's popups.
 */
const passThrough = '.catalogue-overlay-layer';

/**
 * The element the pointer is over: the last one in the document whose box contains the point, which
 * is the one on top.
 */
export function hitAt(scope: Element, point: Point): Element {
  const elements = [...scope.querySelectorAll('*')].reverse();
  for (const element of elements) {
    if (element.matches(passThrough)) continue;
    // An inline element wrapped over several lines, such as a link, is only where its lines are,
    // not across the box around them, which may contain another link.
    const under = [...element.getClientRects()].some(
      (box) =>
        box.width >= 1 &&
        box.height >= 1 &&
        point.x >= box.left &&
        point.x <= box.right &&
        point.y >= box.top &&
        point.y <= box.bottom,
    );
    if (!under) continue;
    // What a surrounding box clips away, such as a page's body past the bottom of the region it
    // scrolls in, under the bar below it, can't be hit.
    if (clippedAt(scope, element, point)) continue;
    const style = getComputedStyle(element);
    // An element that is clipped away entirely, such as a screen reader's announcer, is not a
    // target.
    if (/^inset\((50|100)%/.test(style.clipPath)) continue;
    if (style.visibility === 'hidden') continue;
    // An element that lets the pointer through, such as a slider's label over its track, isn't hit;
    // one that only inherits that from the stage's overlay layer, such as a popup in it, is.
    if (style.pointerEvents === 'none' && !fromLayer(element)) continue;
    return element;
  }
  return scope;
}

/**
 * Whether a point of an element is clipped away by a surrounding box inside the stage that clips
 * its overflow, as the browser's own hit test would leave it out. A box positioned out of flow
 * escapes the clips between it and the box that positions it: an absolute box escapes those up to
 * its nearest positioned ancestor, and a fixed box every clip inside the stage, whose canvas
 * positions it.
 */
function clippedAt(scope: Element, element: Element, point: Point) {
  let escapes: 'none' | 'absolute' | 'fixed' = 'none';
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (node !== element) {
      // The box that positions it: a positioned box for an absolute one, a transformed box for a
      // fixed one, since a transform also positions what is fixed.
      const transformed = style.transform !== 'none';
      if (escapes === 'absolute' && (style.position !== 'static' || transformed)) escapes = 'none';
      if (escapes === 'fixed' && transformed) escapes = 'none';
      const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
      if (clips && escapes === 'none') {
        const box = node.getBoundingClientRect();
        if (point.x < box.left || point.x > box.right || point.y < box.top || point.y > box.bottom)
          return true;
      }
    }
    if (escapes === 'none' && style.position === 'absolute') escapes = 'absolute';
    if (style.position === 'fixed') escapes = 'fixed';
  }
  return false;
}

/**
 * Whether an element lets the pointer through only because the overlay layer around it does. Such
 * an element takes the pointer once the layer does, unless its own rule still lets it through, such
 * as a sheet's viewport around a sheet beside the page.
 */
function fromLayer(element: Element) {
  const layer = element.closest(passThrough);
  if (!(layer instanceof HTMLElement)) return false;
  const before = layer.style.pointerEvents;
  layer.style.pointerEvents = 'auto';
  const inherited = getComputedStyle(element).pointerEvents !== 'none';
  layer.style.pointerEvents = before;
  return inherited;
}

/** The element and those around it, inside the stage, which :hover would all match. */
export function chainOf(scope: Element, element: Element) {
  const chain: Element[] = [];
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement)
    chain.push(node);
  return chain;
}
