/*
 * The virtual pointer's wheel (VirtualPointer.ts). A turn scrolls the nearest scrollable box around
 * the element under the pointer, as a mouse wheel does, never the page.
 */
import type { PointerSpot } from './pointer/PointerTargets';

export class WheelControl {
  /** The box a turn of the wheel scrolls, and its scroll position when the turn started. */
  private turn: {
    target: Element;
    box: HTMLElement | null;
    axis: 'x' | 'y';
    from: number;
    done: number;
    snap: string;
  } | null = null;

  constructor(private readonly spot: PointerSpot) {}

  /**
   * Starts turning the wheel over the element under the pointer. It scrolls the nearest box around
   * that element, inside the stage, that can scroll along the axis; never the page.
   */
  start(axis: 'x' | 'y') {
    this.end();
    const target = this.spot.over[0];
    if (!target) return;
    let box: HTMLElement | null = null;
    for (
      let node: Element | null = target;
      node && node !== this.spot.scope;
      node = node.parentElement
    ) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      const overflow = axis === 'y' ? style.overflowY : style.overflowX;
      const room =
        axis === 'y' ? node.scrollHeight - node.clientHeight : node.scrollWidth - node.clientWidth;
      if (/auto|scroll/.test(overflow) && room > 0) {
        box = node;
        break;
      }
    }
    // A box with scroll snapping would snap at each step of the turn, so snapping is off until the
    // turn ends.
    const snap = box?.style.scrollSnapType ?? '';
    if (box) box.style.scrollSnapType = 'none';
    const from = box ? (axis === 'y' ? box.scrollTop : box.scrollLeft) : 0;
    this.turn = { target, box, axis, from, done: 0, snap };
  }

  /**
   * Turns the wheel to `distance` px from where the turn started. The element under the pointer
   * receives the wheel events, and unless it handles the turn itself, the box scrolls there.
   */
  to(distance: number) {
    const turn = this.turn;
    if (!turn) return;
    const delta = distance - turn.done;
    turn.done = distance;
    if (Math.abs(delta) < 0.01) return;
    const point = this.spot.at ?? { x: 0, y: 0 };
    const sent = turn.target.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: point.x,
        clientY: point.y,
        deltaX: turn.axis === 'x' ? delta : 0,
        deltaY: turn.axis === 'y' ? delta : 0,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        view: window,
        ...this.spot.modifiers,
      }),
    );
    if (!sent || !turn.box) return;
    const to = turn.from + distance;
    turn.box.scrollTo({ [turn.axis === 'y' ? 'top' : 'left']: to, behavior: 'instant' });
  }

  /** Ends a turn of the wheel: a box with scroll snapping snaps again. */
  end() {
    const turn = this.turn;
    this.turn = null;
    if (turn?.box) turn.box.style.scrollSnapType = turn.snap;
  }
}
