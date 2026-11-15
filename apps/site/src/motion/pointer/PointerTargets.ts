export interface Point {
  x: number;
  y: number;
}

export interface Aimed {
  point: Point;
  target: Element;
}

export interface Modifiers {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export interface PointerSpot {
  readonly scope: Element;
  at: Point | null;
  over: Element[];
  readonly modifiers: Modifiers;
  moveTo(point: Point): void;
  noteScope(): void;
  drawCursor(): void;
}

export const textFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"]), textarea, [contenteditable="true"]';

const passThrough = '.catalogue-overlay-layer';

export function hitAt(scope: Element, point: Point): Element {
  const elements = [...scope.querySelectorAll('*')].reverse();
  for (const element of elements) {
    if (element.matches(passThrough)) continue;
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
    if (clippedAt(scope, element, point)) continue;
    const style = getComputedStyle(element);
    const clippedAway = /^inset\((50|100)%/.test(style.clipPath);
    if (clippedAway) continue;
    if (style.visibility === 'hidden') continue;
    const letsPointerThrough =
      style.pointerEvents === 'none' && !inheritsPassThroughFromLayer(element);
    if (letsPointerThrough) continue;
    return element;
  }
  return scope;
}

function clippedAt(scope: Element, element: Element, point: Point) {
  let escapes: 'none' | 'absolute' | 'fixed' = 'none';
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (node !== element) {
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

function inheritsPassThroughFromLayer(element: Element) {
  const layer = element.closest(passThrough);
  if (!(layer instanceof HTMLElement)) return false;
  const before = layer.style.pointerEvents;
  layer.style.pointerEvents = 'auto';
  const inherited = getComputedStyle(element).pointerEvents !== 'none';
  layer.style.pointerEvents = before;
  return inherited;
}

export function chainOf(scope: Element, element: Element) {
  const chain: Element[] = [];
  for (let node: Element | null = element; node && node !== scope; node = node.parentElement)
    chain.push(node);
  return chain;
}
