/*
 * What the pointer no one sees is over (VirtualPointer.ts): the element a point of its stage hits,
 * as a browser's own hit test finds it, and the elements around it, which its controllers share.
 */

/** A point of the pointer's, in the viewport's coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** A point a move goes to, and the element under it, read ahead of the move (VirtualPointer.aim). */
export interface Aimed {
  point: Point;
  target: Element;
}

/** The flags of the modifier keys held, which every event the pointer sends carries. */
export interface Modifiers {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Where a pointer is over its stage, which its controllers share and its VirtualPointer keeps: its
 * stage, `scope`, the point it is at and the elements it is over, the innermost first.
 */
export interface PointerSpot {
  readonly scope: Element;
  at: Point | null;
  over: Element[];
  /** The flags of the modifier keys held now (KeyboardControl.ts). */
  readonly modifiers: Modifiers;
  /** Moves the pointer to a point, as a move of its script does (VirtualPointer.moveTo). */
  moveTo(point: Point): void;
  /** Notes where the stage is, as the pointer moves over it. */
  noteScope(): void;
  /** Draws its cursor where it is, pressed or not, carrying or not. */
  drawCursor(): void;
}

/** Fields a press focuses, as typing goes into them. */
export const textFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"]), textarea, [contenteditable="true"]';

/** A layer over a whole stage, which no pointer is over: it only holds the stage's popups. */
const passThrough = '.catalogue-overlay-layer';

/** The element the pointer is over: the last in the document whose box holds it, as on top. */
export function hitAt(scope: Element, point: Point): Element {
  const elements = [...scope.querySelectorAll('*')].reverse();
  for (const element of elements) {
    if (element.matches(passThrough)) continue;
    // An inline element wrapped over lines, such as a link, is only where its lines are, not
    // across the box around them, which may hold another link.
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
    // What a box around it clips away, such as a page's body past the foot of the region it
    // scrolls in, under the bar below it, isn't there to be hit.
    if (clippedAt(scope, element, point)) continue;
    const style = getComputedStyle(element);
    // What is clipped away whole, such as a screen reader's announcer, is no target.
    if (/^inset\((50|100)%/.test(style.clipPath)) continue;
    if (style.visibility === 'hidden') continue;
    // What lets the pointer through, such as a slider's label over its track, isn't hit; what
    // only takes that from the stage's overlay layer, such as a popup in it, is.
    if (style.pointerEvents === 'none' && !fromLayer(element)) continue;
    return element;
  }
  return scope;
}

/**
 * Whether a point of an element is clipped away by a box around it inside the stage that clips
 * what overflows it, as a browser's own hit test leaves it out. A box placed out of flow escapes
 * the clips between it and the box that places it: an absolute one those up to its nearest
 * positioned ancestor, a fixed one every clip inside the stage, whose canvas places it.
 */
function clippedAt(scope: Element, element: Element, point: Point) {
  let escapes: 'none' | 'absolute' | 'fixed' = 'none';
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (node !== element) {
      // The box that places it: for an absolute one a positioned box, for a fixed one a
      // transformed box, which also places what is fixed.
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
 * Whether an element lets the pointer through only as the overlay layer around it does: it
 * takes the pointer once the layer does, where its own rule, such as a sheet's viewport's around
 * a sheet beside the page, lets it through still.
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

/** The element and those around it, inside the stage, as :hover marks them all. */
export function chainOf(scope: Element, element: Element) {
  const chain: Element[] = [];
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement)
    chain.push(node);
  return chain;
}
