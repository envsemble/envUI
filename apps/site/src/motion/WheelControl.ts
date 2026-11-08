/*
 * The wheel of the pointer no one sees (VirtualPointer.ts): a turn scrolls the nearest box around
 * what the pointer is over that can scroll, as a mouse's wheel does, never the page.
 */
import type { PointerSpot } from './PointerTargets';

export class WheelControl {
  /** The box a turn of the wheel scrolls, and where it started, while it turns. */
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
   * Starts turning the wheel over the element under the pointer: it scrolls the nearest box around
   * it in the stage that can scroll along the axis, never the page.
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
    // A box that snaps would snap at each step of the turn: it snaps once the turn ends.
    const snap = box?.style.scrollSnapType ?? '';
    if (box) box.style.scrollSnapType = 'none';
    const from = box ? (axis === 'y' ? box.scrollTop : box.scrollLeft) : 0;
    this.turn = { target, box, axis, from, done: 0, snap };
  }

  /**
   * Turns the wheel on to `distance` px from where the turn started: the element under the pointer
   * hears the wheel, and unless it takes the turn for itself, the box scrolls there.
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

  /** Ends a turn of the wheel: a box that snaps snaps again. */
  end() {
    const turn = this.turn;
    this.turn = null;
    if (turn?.box) turn.box.style.scrollSnapType = turn.snap;
  }
}
