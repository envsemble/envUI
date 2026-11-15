import type { PointerSelection } from './VirtualSelection';
import type { KeyboardControl } from '../KeyboardControl';
import { hoverMark, mark, pressMark } from './PointerStates';
import {
  chainOf,
  hitAt,
  textFields,
  type Aimed,
  type Point,
  type PointerSpot,
} from './PointerTargets';
import { captures, keepClipboard, keyboardFocused } from '../BrowserStandIns';

let pressingPointerId: number | null = null;

export function holdReaderMoves() {
  const page = window as { catalogueHoldsMoves?: boolean };
  if (page.catalogueHoldsMoves) return;
  page.catalogueHoldsMoves = true;
  const hold = (event: Event) => {
    if (event.isTrusted && pressingPointerId !== null) event.stopImmediatePropagation();
  };
  for (const type of ['pointermove', 'mousemove'])
    window.addEventListener(type, hold, { capture: true });
}

const mouseTwin: Record<string, string> = {
  pointerover: 'mouseover',
  pointerenter: 'mouseenter',
  pointermove: 'mousemove',
  pointerdown: 'mousedown',
  pointerup: 'mouseup',
  pointerout: 'mouseout',
  pointerleave: 'mouseleave',
};

const nonBubbling = new Set(['pointerenter', 'pointerleave', 'mouseenter', 'mouseleave']);

const doubleClickTimeMs = 500;

const restTolerancePx = 0.05;

export class PointerControl {
  private pressed: Element[] = [];
  buttons = 0;
  private mouseless = false;
  private button = 0;
  private selects = false;
  private suspended = false;
  private lastClick: { target: Element; time: number } | null = null;

  constructor(
    private readonly id: number,
    private readonly spot: PointerSpot,
    private readonly keyboard: KeyboardControl,
    private readonly selection: PointerSelection,
  ) {}

  private onContent<T extends MouseEvent>(event: T): T {
    const scrolled = this.scrolled();
    Object.defineProperty(event, 'pageX', { value: event.clientX + scrolled.x });
    Object.defineProperty(event, 'pageY', { value: event.clientY + scrolled.y });
    return event;
  }

  private scrolling: { x: number; y: number } | undefined;

  private scrolled() {
    if (!this.scrolling) {
      const scrolled = { x: 0, y: 0 };
      for (let node = this.spot.scope.parentElement; node; node = node.parentElement) {
        scrolled.x += node.scrollLeft;
        scrolled.y += node.scrollTop;
      }
      this.scrolling = scrolled;
      queueMicrotask(() => (this.scrolling = undefined));
    }
    return this.scrolling;
  }

  private send(target: Element, type: string, init: PointerEventInit = {}) {
    const point = this.spot.at ?? { x: 0, y: 0 };
    const options: PointerEventInit = {
      bubbles: !nonBubbling.has(type),
      cancelable: !nonBubbling.has(type),
      composed: true,
      clientX: point.x,
      clientY: point.y,
      pointerId: this.id,
      pointerType: 'mouse',
      isPrimary: true,
      button: -1,
      buttons: this.buttons,
      view: window,
      ...this.spot.modifiers,
      ...init,
    };
    const sent = target.dispatchEvent(this.onContent(new PointerEvent(type, options)));
    if (type === 'pointerdown') this.mouseless = !sent;
    const twin = mouseTwin[type];
    if (twin && !(this.mouseless && /down|move|up/.test(twin))) {
      const twinSent = target.dispatchEvent(this.onContent(new MouseEvent(twin, options)));
      return sent && twinSent;
    }
    return sent;
  }

  rests(point: Point) {
    const from = this.spot.at;
    return Boolean(
      from &&
      Math.abs(point.x - from.x) < restTolerancePx &&
      Math.abs(point.y - from.y) < restTolerancePx,
    );
  }

  moveTo(point: Point, aimed: Aimed | null) {
    const spot = this.spot;
    if (this.rests(point)) return;
    const from = spot.at;
    spot.at = point;
    spot.noteScope();
    const target = aimed?.point === point ? aimed.target : hitAt(spot.scope, point);
    const chain = chainOf(spot.scope, target);
    const previous = spot.over[0] ?? null;
    const left = spot.over.filter((element) => !chain.includes(element));
    const entered = chain.filter((element) => !spot.over.includes(element));
    if (previous && previous !== target)
      this.send(previous, 'pointerout', { relatedTarget: target });
    for (const element of left) {
      this.send(element, 'pointerleave', { relatedTarget: target });
      mark(element, hoverMark, false);
    }
    if (previous !== target || !from) this.send(target, 'pointerover', { relatedTarget: previous });
    for (const element of entered.reverse()) {
      mark(element, hoverMark, true);
      this.send(element, 'pointerenter', { relatedTarget: previous });
    }
    spot.over = chain;
    this.send(captures.get(this.id) ?? target, 'pointermove');
    if (this.buttons === 1 && this.selects && !captures.get(this.id)) this.selection.extend(point);
    spot.drawCursor();
  }

  suspend() {
    if (!this.buttons || pressingPointerId !== this.id) return;
    pressingPointerId = null;
    this.suspended = true;
  }

  resume() {
    if (!this.suspended) return this.canPress;
    if (pressingPointerId !== null) return false;
    this.suspended = false;
    const target = this.spot.over[0];
    pressingPointerId = this.id;
    if (target) this.send(target, 'pointerdown', { button: this.button });
    return true;
  }

  get canPress() {
    return pressingPointerId === null || pressingPointerId === this.id;
  }

  press(button: 0 | 2 = 0) {
    const spot = this.spot;
    const at = spot.at;
    const overReplaced = spot.over[0] && !spot.over[0].isConnected;
    if (at && overReplaced) {
      spot.at = null;
      spot.moveTo(at);
    }
    const target = spot.over[0];
    if (!target || this.buttons) return;
    pressingPointerId = this.id;
    this.button = button;
    this.buttons = button === 2 ? 2 : 1;
    spot.drawCursor();
    const sent = this.send(target, 'pointerdown', { button });
    this.pressed = [...spot.over];
    if (button === 0) for (const element of this.pressed) mark(element, pressMark, true);
    if (keyboardFocused.has(spot.scope)) this.keyboard.keyboardFocus(null);
    if (sent) this.keyboard.focus(target.closest(textFields));
    if (button === 2) {
      const point = spot.at ?? { x: 0, y: 0 };
      target.dispatchEvent(
        new PointerEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX: point.x,
          clientY: point.y,
          pointerId: this.id,
          pointerType: 'mouse',
          isPrimary: true,
          button: 2,
          buttons: 2,
          view: window,
          ...spot.modifiers,
        }),
      );
      return;
    }
    this.selects = sent;
    if (sent && spot.at) this.selection.begin(spot.at, target);
    else if (sent) this.selection.clear();
  }

  release() {
    if (!this.buttons) return;
    const spot = this.spot;
    const button = this.button;
    this.buttons = 0;
    this.button = 0;
    this.selects = false;
    if (pressingPointerId === this.id) pressingPointerId = null;
    const captured = captures.get(this.id);
    const target = captured ?? spot.over[0] ?? spot.scope;
    this.send(target, 'pointerup', { button });
    if (captured) {
      captures.set(this.id, null);
      captured.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: this.id }));
    }
    const shared =
      button === 0 &&
      this.pressed.find((element) => element.isConnected && spot.over.includes(element));
    if (shared) {
      const point = spot.at ?? { x: 0, y: 0 };
      const now = performance.now();
      const doubleClick =
        this.lastClick?.target === shared && now - this.lastClick.time < doubleClickTimeMs;
      this.lastClick = doubleClick ? null : { target: shared, time: now };
      const init = {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: doubleClick ? 2 : 1,
        button: 0,
        clientX: point.x,
        clientY: point.y,
        view: window,
        ...spot.modifiers,
      };
      keepClipboard(() => shared.dispatchEvent(new MouseEvent('click', init)));
      if (doubleClick) shared.dispatchEvent(new MouseEvent('dblclick', init));
    }
    for (const element of this.pressed) mark(element, pressMark, false);
    this.pressed = [];
    this.mouseless = false;
    spot.drawCursor();
  }

  unhover() {
    const spot = this.spot;
    if (spot.over[0]) this.send(spot.over[0], 'pointerout');
    for (const element of spot.over) {
      this.send(element, 'pointerleave');
      mark(element, hoverMark, false);
    }
    spot.over = [];
  }
}
