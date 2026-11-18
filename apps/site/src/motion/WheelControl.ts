import type { PointerSpot } from './pointer/PointerTargets';

const negligibleDeltaPx = 0.01;

export class WheelControl {
  private turn: {
    target: Element;
    box: HTMLElement | null;
    axis: 'x' | 'y';
    from: number;
    done: number;
    snap: string;
  } | null = null;

  constructor(private readonly spot: PointerSpot) {}

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
    const snap = box?.style.scrollSnapType ?? '';
    if (box) box.style.scrollSnapType = 'none';
    const from = box ? (axis === 'y' ? box.scrollTop : box.scrollLeft) : 0;
    this.turn = { target, box, axis, from, done: 0, snap };
  }

  to(distance: number) {
    const turn = this.turn;
    if (!turn) return;
    const delta = distance - turn.done;
    turn.done = distance;
    if (Math.abs(delta) < negligibleDeltaPx) return;
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

  end() {
    const turn = this.turn;
    this.turn = null;
    if (turn?.box) turn.box.style.scrollSnapType = turn.snap;
  }
}
