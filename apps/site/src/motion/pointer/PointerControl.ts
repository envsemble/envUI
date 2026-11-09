/*
 * The virtual pointer as a mouse (VirtualPointer.ts): its moves, what it hovers, its presses and
 * releases, and the clicks they make, with the same events a mouse sends.
 */
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

/**
 * The id of the pointer holding its button down, if any. A page has one mouse, so a component that
 * follows a drag on the document, such as a slider, receives every move there, and treats a move
 * without a button as the end of its drag. While one pointer holds its button, the others wait
 * (usePointer).
 */
let pressing: number | null = null;

/**
 * Keeps the reader's own mouse moves from the page's listeners while a virtual pointer holds its
 * button down. A component following that drag on the document, such as a slider, would treat a
 * move without a button, such as the reader reaching for a pause button, as the end of the drag.
 * The reader's presses and clicks still go through.
 */
export function holdReaderMoves() {
  // A flag on the window, whose type declares none, so the listeners are added once per page,
  // also after a hot reload of this module.
  const page = window as { catalogueHoldsMoves?: boolean };
  if (page.catalogueHoldsMoves) return;
  page.catalogueHoldsMoves = true;
  const hold = (event: Event) => {
    if (event.isTrusted && pressing !== null) event.stopImmediatePropagation();
  };
  for (const type of ['pointermove', 'mousemove'])
    window.addEventListener(type, hold, { capture: true });
}

/** The mouse event the browser sends after a pointer event, for older handlers. */
const mouseTwin: Record<string, string> = {
  pointerover: 'mouseover',
  pointerenter: 'mouseenter',
  pointermove: 'mousemove',
  pointerdown: 'mousedown',
  pointerup: 'mouseup',
  pointerout: 'mouseout',
  pointerleave: 'mouseleave',
};

/** Events that don't bubble: each element the pointer enters or leaves gets its own. */
const once = new Set(['pointerenter', 'pointerleave', 'mouseenter', 'mouseleave']);

/** How soon a second click makes a double click, in ms, as a desktop's default. */
const doubleClickTime = 500;

export class PointerControl {
  private pressed: Element[] = [];
  /** The buttons held, as a mouse event's `buttons` gives them. */
  buttons = 0;
  /**
   * Whether the page handled the press itself, which stops the matching mouse events being sent.
   */
  private mouseless = false;
  /** The button held: 0, the main one, or 2, the secondary one, which opens a context menu. */
  private button = 0;
  /** Whether the press may select text by dragging: nothing handled it. */
  private selects = false;
  /** Whether its press released the page's lock while its stage was paused. */
  private suspended = false;
  /** The last click; a second click soon after on the same element makes a double click. */
  private lastClick: { target: Element; time: number } | null = null;

  constructor(
    private readonly id: number,
    private readonly spot: PointerSpot,
    private readonly keyboard: KeyboardControl,
    private readonly selection: PointerSelection,
  ) {}

  /**
   * Gives an event the pointer's position on the page's content as its page position. The page here
   * scrolls in a box rather than the window, so the browser's page position would be the
   * viewport's. A component that follows a drag by how far its page position moves, such as React
   * Aria's color area, then doesn't take the pointer, carried with the content as the page scrolls,
   * for a move.
   */
  private onContent<T extends MouseEvent>(event: T): T {
    const scrolled = this.scrolled();
    Object.defineProperty(event, 'pageX', { value: event.clientX + scrolled.x });
    Object.defineProperty(event, 'pageY', { value: event.clientY + scrolled.y });
    return event;
  }

  /** How far the boxes around the stage are scrolled, read once for the events of one task. */
  private scrolling: { x: number; y: number } | undefined;

  /**
   * How far the boxes around the stage are scrolled, across and down. Reading it lays the page out,
   * and between two events the page's handlers have changed it, so it is read once for the events
   * one task sends, such as a frame's move and its mouse twin, in which nothing scrolls the page.
   */
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
      bubbles: !once.has(type),
      cancelable: !once.has(type),
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
    // A press the page handles itself, by preventing its default, sends no mouse events after it.
    if (type === 'pointerdown') this.mouseless = !sent;
    const twin = mouseTwin[type];
    if (twin && !(this.mouseless && /down|move|up/.test(twin))) {
      const twinSent = target.dispatchEvent(this.onContent(new MouseEvent(twin, options)));
      return sent && twinSent;
    }
    return sent;
  }

  /** Whether a move to a point is no move: a pointer at rest sends nothing. */
  rests(point: Point) {
    const from = this.spot.at;
    return Boolean(from && Math.abs(point.x - from.x) < 0.05 && Math.abs(point.y - from.y) < 0.05);
  }

  /**
   * Moves the pointer to a point, entering the stage there if it wasn't over it. `aimed`, what aim
   * found for the point, saves reading the layout again.
   */
  moveTo(point: Point, aimed: Aimed | null) {
    const spot = this.spot;
    // A pointer at rest sends nothing, as a resting mouse doesn't: a tooltip opens once it rests.
    if (this.rests(point)) return;
    const from = spot.at;
    spot.at = point;
    spot.noteScope();
    const target = aimed?.point === point ? aimed.target : hitAt(spot.scope, point);
    const chain = chainOf(spot.scope, target);
    const previous = spot.over[0] ?? null;
    const left = spot.over.filter((element) => !chain.includes(element));
    const entered = chain.filter((element) => !spot.over.includes(element));
    // Each says where the pointer comes from or goes to, as a mouse's events do, so a component
    // that follows enter and leave by them, such as React, sees a move inside it as one.
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
    // A drag across text selects it, unless something handled the drag, as a slider's thumb does.
    if (this.buttons === 1 && this.selects && !captures.get(this.id)) this.selection.extend(point);
    spot.drawCursor();
  }

  /**
   * Its stage is paused: a press it holds releases the page's lock, so nothing waits on a paused
   * stage, and the reader's moves reach the page again.
   */
  suspend() {
    if (!this.buttons || pressing !== this.id) return;
    pressing = null;
    this.suspended = true;
  }

  /**
   * Its stage plays again: a press it held is taken up again where it is, as a hand pressing again,
   * so a drag the page ended meanwhile continues. Returns whether it may continue, once the lock is
   * free.
   */
  resume() {
    if (!this.suspended) return this.canPress;
    if (pressing !== null) return false;
    this.suspended = false;
    const target = this.spot.over[0];
    pressing = this.id;
    if (target) this.send(target, 'pointerdown', { button: this.button });
    return true;
  }

  /**
   * Whether this pointer may continue now: no other pointer is holding its button down on the page.
   */
  get canPress() {
    return pressing === null || pressing === this.id;
  }

  /**
   * Presses the pointer's button where it is: the main button, or with `button` 2 the secondary
   * one, whose press asks for a context menu, as a right click does. A press of the main button on
   * text starts a selection that a drag extends, and clears what was selected.
   */
  press(button: 0 | 2 = 0) {
    const spot = this.spot;
    // What was under the pointer may have been replaced since it came to rest, as a button's icon
    // is replaced by its spinner and back: a press goes to what is there now, as a mouse's does.
    if (spot.at && spot.over[0] && !spot.over[0].isConnected) {
      const at = spot.at;
      spot.at = null;
      spot.moveTo(at);
    }
    const target = spot.over[0];
    if (!target || this.buttons) return;
    pressing = this.id;
    this.button = button;
    this.buttons = button === 2 ? 2 : 1;
    spot.drawCursor();
    const sent = this.send(target, 'pointerdown', { button });
    this.pressed = [...spot.over];
    if (button === 0) for (const element of this.pressed) mark(element, pressMark, true);
    // A press in a field focuses it, and a press anywhere else takes focus from the field, unless
    // the page prevents it, as a formatting button does. A button shows no focus ring under a
    // pointer, so it isn't marked.
    if (keyboardFocused.has(spot.scope)) this.keyboard.keyboardFocus(null);
    if (sent) this.keyboard.focus(target.closest(textFields));
    if (button === 2) {
      // When the secondary button goes down, the context menu is asked for where the pointer is.
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
    // A press whose default the page prevents, such as on a formatting button, leaves the selection
    // as it was, as a browser does.
    if (sent && spot.at) this.selection.begin(spot.at, target);
    else if (sent) this.selection.clear();
  }

  /** Releases the button: the press ends, and if it ends on what it began on, it clicks. */
  release() {
    if (!this.buttons) return;
    const spot = this.spot;
    const button = this.button;
    this.buttons = 0;
    this.button = 0;
    this.selects = false;
    if (pressing === this.id) pressing = null;
    const captured = captures.get(this.id);
    const target = captured ?? spot.over[0] ?? spot.scope;
    this.send(target, 'pointerup', { button });
    if (captured) {
      captures.set(this.id, null);
      captured.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: this.id }));
    }
    // A click goes to the nearest element the press and the release share; the secondary button
    // asked for its context menu when it went down. No click goes to an element the page has
    // removed, such as while it navigates to another page: a link would still follow its address,
    // outside the figure that keeps its links in place.
    const shared =
      button === 0 &&
      this.pressed.find((element) => element.isConnected && spot.over.includes(element));
    if (shared) {
      const point = spot.at ?? { x: 0, y: 0 };
      // A second click on the same element soon after the first is a double click, as with a mouse.
      const now = performance.now();
      const second =
        this.lastClick?.target === shared && now - this.lastClick.time < doubleClickTime;
      this.lastClick = second ? null : { target: shared, time: now };
      const init = {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: second ? 2 : 1,
        button: 0,
        clientX: point.x,
        clientY: point.y,
        view: window,
        ...spot.modifiers,
      };
      keepClipboard(() => shared.dispatchEvent(new MouseEvent('click', init)));
      if (second) shared.dispatchEvent(new MouseEvent('dblclick', init));
    }
    for (const element of this.pressed) mark(element, pressMark, false);
    this.pressed = [];
    this.mouseless = false;
    spot.drawCursor();
  }

  /** Leaves what it is over: each element receives the leave events and loses its hover. */
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
