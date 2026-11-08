/*
 * What a resting picture holds still (useFit.ts): the popups a held view rests open on, and the
 * shape a resting picture was framed on, measured, so it holds that frame as its popups are placed
 * again (holdsFrame, HeldView.ts).
 */
import { holdsView, mustShowOf } from '../motion/MustShow';
import type { Shape } from './HeldView';
import type { Shown } from './PaintedBoxes';

/**
 * What a held view's still shows whole of the popup it rests open on: a menu's items, and what is
 * chosen in it, such as a date picker's day or the row in the middle of a time picker's wheels.
 */
const heldItems = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox'].map((role) => `[role='${role}']`),
  "[aria-selected='true']",
  '.env-time-list-row[data-centered]',
]
  .map((part) => `.catalogue-overlay-layer ${part}`)
  .join(', ');

/**
 * A tile that holds its view is framed on its largest state: what its script acts on, also where
 * it is laid out, such as a pile's avatars in the row they spread into as it plays, so its view is
 * the same whenever and wherever the pointer comes in, and what it rests open on (heldItems). Any
 * other tile holds nothing.
 */
export function heldElements(canvas: HTMLElement) {
  if (!holdsView(canvas)) return [];
  return [...mustShowOf(canvas), heldItems]
    .flatMap((selector) => {
      try {
        return [...canvas.querySelectorAll(selector)];
      } catch {
        return [];
      }
    })
    .filter((element) => element.checkVisibility());
}

/** What a fit at rest is decided on, where the canvas is in its stage, if that shows whole. */
export function shapeOf(stage: HTMLElement, canvas: HTMLElement, boxes: Shown[]): Shape {
  const canvasBox = canvas.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  return {
    room: [stage.clientWidth, stage.clientHeight, canvas.offsetWidth, canvas.offsetHeight],
    whole: wholeInView(stage),
    view: [canvasBox.left - stageBox.left, canvasBox.top - stageBox.top],
    boxes: boxes.map((shown) => ({ ...shown, popup: layerRoot(shown.element) })),
    popups: new Set(boxes.flatMap(({ element }) => layerRoot(element) ?? [])).size,
  };
}

/**
 * Whether an element shows whole: inside the window and every box around it that clips it, such as
 * the page's body that scrolls, so a popup in it is placed against nothing but the stage's edges.
 */
function wholeInView(element: Element) {
  const box = element.getBoundingClientRect();
  const inside = (around: { left: number; top: number; right: number; bottom: number }) =>
    box.left >= around.left - 0.5 &&
    box.top >= around.top - 0.5 &&
    box.right <= around.right + 0.5 &&
    box.bottom <= around.bottom + 0.5;
  if (!inside({ left: 0, top: 0, right: innerWidth, bottom: innerHeight })) return false;
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    if (!inside(node.getBoundingClientRect())) return false;
  }
  return true;
}

/**
 * The popup an element is part of, open in a picture's overlay layer: the outermost box its theme
 * holds, such as a menu's positioner, or none for what is not in a popup.
 */
function layerRoot(element: Element) {
  let root: Element | null = null;
  let top: Element | null = null;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (node.classList.contains('catalogue-overlay-layer')) return root ?? top;
    if (node.parentElement?.classList.contains('env-theme')) root = node;
    top = node;
  }
  return null;
}
