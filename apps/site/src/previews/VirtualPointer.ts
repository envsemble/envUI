/*
 * A pointer no one sees, which a preview's animation moves over its live component: it hovers,
 * presses, drags and releases by the same events a mouse sends, so the component answers as it
 * does a person, with its own hover, press and drag, rather than a picture of them. The preview is
 * inert, so only these events reach it.
 *
 * What a stylesheet shows under a real pointer, `:hover` and `:active`, no event can set; the
 * pointer marks what it is over with data-catalogue-hover and what it presses with
 * data-catalogue-pressed, and mirrorPointerStates gives every such rule of the site's stylesheets
 * a twin for those marks. A pointer's capture, which a drag takes, is kept for it here too, as the
 * browser keeps none for a pointer it didn't make.
 */

import { PointerSelection } from './VirtualSelection';

/** A point of the pointer's, in the viewport's coordinates. */
interface Point {
  x: number;
  y: number;
}

/** The modifier keys, by their key, and the flag a held one sets on every event. */
const modifierFlags: Record<string, 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey'> = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Shift: 'shiftKey',
  Meta: 'metaKey',
};

/** The physical key a key is typed on, as a keyboard event's `code` names it. */
function codeOf(key: string) {
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
  if (/^\d$/.test(key)) return `Digit${key}`;
  if (key === ' ') return 'Space';
  if (key in modifierFlags) return `${key}Left`;
  return key;
}

const hoverMark = 'data-catalogue-hover';
const pressMark = 'data-catalogue-pressed';
const focusMark = 'data-catalogue-focus';
const focusWithinMark = 'data-catalogue-focus-within';

/**
 * The id of the pointer holding its button down, if any: a page has one mouse, so a component that follows
 * a drag on the document, such as a slider, hears every move there, and takes a move without a
 * button for the end of its drag. While one pointer holds its button, the others wait
 * (usePointer).
 */
let pressing: number | null = null;

/**
 * Keeps the reader's own mouse moves from the page's listeners while a pointer no one sees holds
 * its button down: a component following that drag on the document, such as a slider, would take
 * a move without a button, such as the reader reaching for a pause button, for the drag's end.
 * Their presses and clicks still go through.
 */
function holdReaderMoves() {
  if ((window as { catalogueHoldsMoves?: boolean }).catalogueHoldsMoves) return;
  (window as { catalogueHoldsMoves?: boolean }).catalogueHoldsMoves = true;
  const hold = (event: Event) => {
    if (event.isTrusted && pressing !== null) event.stopImmediatePropagation();
  };
  for (const type of ['pointermove', 'mousemove'])
    window.addEventListener(type, hold, { capture: true });
}

/** The ids of the pointers no one sees, and what each has captured. */
const captures = new Map<number, Element | null>();
let nextId = 9000;

/**
 * Keeps a pointer's capture for the pointers no one sees: the browser throws for an id it doesn't
 * know. Only those ids are kept here; a real pointer's capture is the browser's, as before.
 */
function keepCaptures() {
  const proto = Element.prototype;
  if ((proto as { catalogueCaptures?: boolean }).catalogueCaptures) return;
  (proto as { catalogueCaptures?: boolean }).catalogueCaptures = true;
  const { setPointerCapture, releasePointerCapture, hasPointerCapture } = proto;
  proto.setPointerCapture = function (id: number) {
    if (!captures.has(id)) return setPointerCapture.call(this, id);
    captures.set(id, this);
  };
  proto.releasePointerCapture = function (id: number) {
    if (!captures.has(id)) return releasePointerCapture.call(this, id);
    if (captures.get(id) === this) captures.set(id, null);
  };
  proto.hasPointerCapture = function (id: number) {
    if (!captures.has(id)) return hasPointerCapture.call(this, id);
    return captures.get(id) === this;
  };
}

/** The mouse event a pointer event is followed by, as a browser follows it, for older handlers. */
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

/**
 * Sets or clears one of the pointer's marks on an element, outside an editable region: an editor
 * such as ProseMirror redraws what changes in its document, so a mark inside it would replace
 * the very element pressed. Its frame, outside, still shows hover and focus.
 */
function mark(element: Element, name: string, on: boolean) {
  if (element.closest('[contenteditable="true"]')) return;
  element.toggleAttribute(name, on);
}

/**
 * Runs a click with the reader's clipboard kept as it is: a preview's copy button, pressed by the
 * pointer no one sees, copies nowhere. Its writes resolve, so it shows that it copied.
 */
function keepClipboard(click: () => void) {
  const clipboard = navigator.clipboard as Clipboard | undefined;
  if (!clipboard) return click();
  const names = ['writeText', 'write'] as const;
  // The clipboard's own properties, if any, to put back; its methods are usually its prototype's.
  const own = names.map((name) => Object.getOwnPropertyDescriptor(clipboard, name));
  for (const name of names)
    Object.defineProperty(clipboard, name, { value: () => Promise.resolve(), configurable: true });
  try {
    click();
  } finally {
    names.forEach((name, index) => {
      const descriptor = own[index];
      if (descriptor) Object.defineProperty(clipboard, name, descriptor);
      else delete (clipboard as unknown as Record<string, unknown>)[name];
    });
  }
}

/** Fields a press focuses, as typing goes into them. */
const textFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"]), textarea, [contenteditable="true"]';

/**
 * A small picture for a carried image file, in its type where the browser can write it: a circle
 * in the theme's brand color on its selected fill, as a person's logo or photo would show.
 */
function pictureOf(type: string, scope: Element) {
  if (!/^image\/(png|jpeg|webp)$/.test(type)) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const style = getComputedStyle(scope);
  const color = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  context.fillStyle = color('--env-color-bg-selected', '#dde3f0');
  context.fillRect(0, 0, 96, 96);
  context.fillStyle = color('--env-color-bg-brand-emphasis', '#3557c0');
  context.beginPath();
  context.arc(48, 48, 26, 0, 2 * Math.PI);
  context.fill();
  const [, data = ''] = canvas.toDataURL(type).split(',');
  return Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
}

/** A layer over a whole preview, which no pointer is over: it only holds the preview's popups. */
const passThrough = '.catalogue-overlay-layer';

/** The pointer no one sees, over one preview's elements, `scope`. */
export class VirtualPointer {
  readonly id = nextId++;
  private at: Point | null = null;
  private over: Element[] = [];
  private pressed: Element[] = [];
  private buttons = 0;
  /** Whether the page took the press for itself, which keeps its mouse twins from being sent. */
  private mouseless = false;
  /** The button held: 0, the main one, or 2, the secondary one, which opens a context menu. */
  private button = 0;
  /** The keys held down, such as Alt, whose flags every event carries meanwhile. */
  private held = new Set<string>();
  /** What a drag across text selects. */
  private readonly selection: PointerSelection;
  /** Whether the press may select text by dragging: no one took it for itself. */
  private selects = false;

  constructor(private readonly scope: Element) {
    keepCaptures();
    holdReaderMoves();
    captures.set(this.id, null);
    mirrorPointerStates();
    this.selection = new PointerSelection(scope);
  }

  /** The flags of the modifier keys held, for an event. */
  private get modifiers() {
    const flags = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false };
    for (const key of this.held) if (key in modifierFlags) flags[modifierFlags[key]!] = true;
    return flags;
  }

  /** The element the pointer is over: the last in the document whose box holds it, as on top. */
  private hit(point: Point): Element {
    const elements = [...this.scope.querySelectorAll('*')].reverse();
    for (const element of elements) {
      if (element.matches(passThrough)) continue;
      const box = element.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) continue;
      if (point.x < box.left || point.x > box.right || point.y < box.top || point.y > box.bottom)
        continue;
      const style = getComputedStyle(element);
      // What is clipped away whole, such as a screen reader's announcer, is no target.
      if (/^inset\((50|100)%/.test(style.clipPath)) continue;
      if (style.visibility === 'hidden') continue;
      // What lets the pointer through, such as a slider's label over its track, isn't hit; what
      // only takes that from the preview's overlay layer, such as a popup in it, is.
      if (style.pointerEvents === 'none' && !this.fromLayer(element)) continue;
      return element;
    }
    return this.scope;
  }

  /** Whether an element lets the pointer through only as the overlay layer around it does. */
  private fromLayer(element: Element) {
    let top = element;
    for (
      let node = element.parentElement;
      node && node !== this.scope && getComputedStyle(node).pointerEvents === 'none';
      node = node.parentElement
    )
      top = node;
    return top !== element && top.matches(passThrough);
  }

  /** The element and those around it, inside the preview, as :hover marks them all. */
  private chain(element: Element) {
    const chain: Element[] = [];
    for (let node: Element | null = element; node && node !== this.scope; node = node.parentElement)
      chain.push(node);
    return chain;
  }

  private send(target: Element, type: string, init: PointerEventInit = {}) {
    const point = this.at ?? { x: 0, y: 0 };
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
      ...this.modifiers,
      ...init,
    };
    const sent = target.dispatchEvent(new PointerEvent(type, options));
    // A press the page takes for itself, by preventing its default, sends no mouse events after.
    if (type === 'pointerdown') this.mouseless = !sent;
    const twin = mouseTwin[type];
    if (twin && !(this.mouseless && /down|move|up/.test(twin))) {
      const twinSent = target.dispatchEvent(new MouseEvent(twin, options));
      return sent && twinSent;
    }
    return sent;
  }

  /** A file the pointer carries in from outside, as a drag from the desktop does. */
  private carried: DataTransfer | null = null;

  /**
   * Picks up a file, as a person drags one in from the desktop: its moves are a drag now. Picked up
   * again before a drop, it carries several files together. An image is a real picture, a mark in
   * the theme's brand color, so a preview of it shows something.
   */
  carry(name: string, type: string) {
    this.carried ??= new DataTransfer();
    this.carried.items.add(new File([pictureOf(type, this.scope) ?? 'envUI'], name, { type }));
  }

  private sendDrag(target: Element, type: string) {
    const point = this.at ?? { x: 0, y: 0 };
    return target.dispatchEvent(
      new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: point.x,
        clientY: point.y,
        dataTransfer: this.carried,
      }),
    );
  }

  /** Drops the carried file where the pointer is. */
  drop() {
    const target = this.over[0];
    if (!this.carried || !target) return;
    this.sendDrag(target, 'drop');
    this.carried = null;
    this.over = [];
  }

  /** Moves a carried file over the preview: the elements it enters, leaves and is over hear it. */
  private dragTo(point: Point) {
    this.at = point;
    const target = this.hit(point);
    const chain = this.chain(target);
    for (const element of this.over.filter((item) => !chain.includes(item)))
      this.sendDrag(element, 'dragleave');
    for (const element of chain.filter((item) => !this.over.includes(item)).reverse())
      this.sendDrag(element, 'dragenter');
    this.over = chain;
    this.sendDrag(target, 'dragover');
  }

  /** Moves the pointer to a point, coming over the preview there if it wasn't. */
  moveTo(point: Point) {
    if (this.carried) return this.dragTo(point);
    const from = this.at;
    // A pointer at rest sends nothing, as a resting mouse doesn't: a tooltip opens once it rests.
    if (from && Math.abs(point.x - from.x) < 0.05 && Math.abs(point.y - from.y) < 0.05) return;
    this.at = point;
    const target = this.hit(point);
    const chain = this.chain(target);
    const previous = this.over[0] ?? null;
    const left = this.over.filter((element) => !chain.includes(element));
    const entered = chain.filter((element) => !this.over.includes(element));
    // Each says where the pointer comes from or goes to, as a mouse's do, so a component that
    // follows enter and leave by them, such as React's, sees a move inside it as one.
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
    this.over = chain;
    this.send(captures.get(this.id) ?? target, 'pointermove');
    // A drag across text selects it, unless something took the drag, as a slider's thumb does.
    if (this.buttons === 1 && this.selects && !captures.get(this.id)) this.selection.extend(point);
  }

  /** Whether this pointer may go on now: no other is holding its button down on the page. */
  /** Whether its press was let go of the page's lock while its preview was paused. */
  private suspended = false;

  /**
   * Its preview is paused: a press it holds lets the page's lock go, so nothing waits on a paused
   * preview, and the reader's moves reach the page again.
   */
  suspend() {
    if (!this.buttons || pressing !== this.id) return;
    pressing = null;
    this.suspended = true;
  }

  /**
   * Its preview plays again: a press it held is taken up where it is, as a hand pressing again,
   * so a drag the page ended meanwhile goes on. Returns whether it may go on, once the lock is free.
   */
  resume() {
    if (!this.suspended) return this.canPress;
    if (pressing !== null) return false;
    this.suspended = false;
    const target = this.over[0];
    pressing = this.id;
    if (target) this.send(target, 'pointerdown', { button: this.button });
    return true;
  }

  get canPress() {
    return pressing === null || pressing === this.id;
  }

  /**
   * Presses the pointer's button where it is: the main one, or with `button` 2 the secondary one,
   * whose press asks for a context menu, as a right click does. A press of the main one on text
   * starts a selection that a drag extends, and leaves what was selected unselected.
   */
  press(button: 0 | 2 = 0) {
    const target = this.over[0];
    if (!target || this.buttons) return;
    pressing = this.id;
    this.button = button;
    this.buttons = button === 2 ? 2 : 1;
    const sent = this.send(target, 'pointerdown', { button });
    this.pressed = [...this.over];
    if (button === 0) for (const element of this.pressed) mark(element, pressMark, true);
    // A press in a field focuses it, and anywhere else takes focus from the field. A button keeps
    // no focus ring under a pointer, so it isn't marked.
    this.focus(target.closest(textFields));
    if (button === 2) {
      // As the secondary button goes down, the context menu is asked for where the pointer is.
      const point = this.at ?? { x: 0, y: 0 };
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
          ...this.modifiers,
        }),
      );
      return;
    }
    this.selects = sent;
    if (sent && this.at) this.selection.begin(this.at, target);
    else this.selection.clear();
  }

  /** Releases the button: the press ends, and where it ends on what it began on, it clicks. */
  release() {
    if (!this.buttons) return;
    const button = this.button;
    this.buttons = 0;
    this.button = 0;
    this.selects = false;
    if (pressing === this.id) pressing = null;
    const captured = captures.get(this.id);
    const target = captured ?? this.over[0] ?? this.scope;
    this.send(target, 'pointerup', { button });
    if (captured) {
      captures.set(this.id, null);
      captured.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: this.id }));
    }
    // A click goes to the nearest element the press and the release share; the secondary button
    // asked for its context menu as it went down.
    const shared = button === 0 && this.pressed.find((element) => this.over.includes(element));
    if (shared) {
      const point = this.at ?? { x: 0, y: 0 };
      // A second click on the same element soon after the first is a double click, as a mouse's.
      const now = performance.now();
      const second = this.lastClick?.element === shared && now - this.lastClick.time < 500;
      this.lastClick = second ? null : { element: shared, time: now };
      const options = {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: second ? 2 : 1,
        button: 0,
        clientX: point.x,
        clientY: point.y,
        view: window,
        ...this.modifiers,
      };
      keepClipboard(() => shared.dispatchEvent(new MouseEvent('click', options)));
      if (second) shared.dispatchEvent(new MouseEvent('dblclick', options));
    }
    for (const element of this.pressed) mark(element, pressMark, false);
    this.pressed = [];
    this.mouseless = false;
  }

  /** The last click, which a second one soon after on the same element makes a double click. */
  private lastClick: { element: Element; time: number } | null = null;

  /** The field typed into, marked as focused, as an inert preview can't focus it. */
  private focused: Element | null = null;

  /** Marks a field as focused, and what holds it as holding focus. */
  focus(element: Element | null) {
    if (this.focused === element) return;
    if (this.focused) {
      mark(this.focused, focusMark, false);
      for (const node of this.chain(this.focused)) mark(node, focusWithinMark, false);
    }
    this.focused = element;
    if (!element) return;
    mark(element, focusMark, true);
    for (const node of this.chain(element)) mark(node, focusWithinMark, true);
  }

  /**
   * Types into a field of the preview as a keyboard does: a key down, the text going in, which
   * a component that holds the field's value hears as an input event, and the key up. `text` is
   * the characters to add, or `null` to delete the last one.
   */
  type(selector: string, text: string | null) {
    const field = this.scope.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (!field) return;
    this.focus(field);
    const keyboard = this.keyboard(text ?? 'Backspace');
    if (!field.dispatchEvent(new KeyboardEvent('keydown', keyboard))) return;
    // Over what a drag selected in the field, or at its end.
    const { value, at } = this.selection.typed(field, text);
    // The value's own setter, under React's, so React sees the change as typing.
    const prototype =
      field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(field, value);
    if (at !== value.length) field.setSelectionRange(at, at);
    field.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        inputType: text === null ? 'deleteContentBackward' : 'insertText',
        data: text,
      }),
    );
    field.dispatchEvent(new KeyboardEvent('keyup', keyboard));
  }

  /** A keyboard event's fields for a key, with the modifier keys held. */
  private keyboard(key: string) {
    return {
      key,
      code: codeOf(key),
      bubbles: true,
      cancelable: true,
      composed: true,
      ...this.modifiers,
    };
  }

  /** What a key goes to: an element of the preview, or the field typed into, or the preview. */
  private keyTarget(selector?: string) {
    return (selector && this.scope.querySelector(selector)) || this.focused || this.scope;
  }

  /**
   * Presses a key on an element of the preview, or on the field typed into, with what a browser
   * does for it there: Tab leaves the field typed into, which hears its blur, and Enter in a
   * single-line field submits its form.
   */
  key(key: string, selector?: string) {
    const target = this.keyTarget(selector);
    const allowed = target.dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
    if (allowed && key === 'Tab' && target === this.focused) {
      this.focus(null);
      target.dispatchEvent(new FocusEvent('blur'));
      target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    }
    if (
      allowed &&
      key === 'Enter' &&
      target instanceof HTMLInputElement &&
      target.matches(textFields)
    )
      target.form?.requestSubmit();
    target.dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  /**
   * Holds a key down, such as Alt, on an element of the preview or the field typed into: while it
   * is held, every event the pointer and the keyboard send carries its flag, as Alt with a letter.
   */
  keyDown(key: string, selector?: string) {
    if (this.held.has(key)) return;
    this.held.add(key);
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
  }

  /** Lets a held key go. */
  keyUp(key: string, selector?: string) {
    if (!this.held.delete(key)) return;
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  /** The box a turn of the wheel scrolls, and where it started, while it turns. */
  private turn: {
    target: Element;
    box: HTMLElement | null;
    axis: 'x' | 'y';
    from: number;
    done: number;
    snap: string;
  } | null = null;

  /**
   * Starts turning the wheel over the element under the pointer: it scrolls the nearest box around
   * it in the preview that can scroll along the axis, never the page.
   */
  startWheel(axis: 'x' | 'y') {
    this.endWheel();
    const target = this.over[0];
    if (!target) return;
    let box: HTMLElement | null = null;
    for (
      let node: Element | null = target;
      node && node !== this.scope;
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
  turnWheel(distance: number) {
    const turn = this.turn;
    if (!turn) return;
    const delta = distance - turn.done;
    turn.done = distance;
    if (Math.abs(delta) < 0.01) return;
    const point = this.at ?? { x: 0, y: 0 };
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
        ...this.modifiers,
      }),
    );
    if (!sent || !turn.box) return;
    const to = turn.from + distance;
    turn.box.scrollTo({ [turn.axis === 'y' ? 'top' : 'left']: to, behavior: 'instant' });
  }

  /** Ends a turn of the wheel: a box that snaps snaps again. */
  endWheel() {
    const turn = this.turn;
    this.turn = null;
    if (turn?.box) turn.box.style.scrollSnapType = turn.snap;
  }

  /** Takes the pointer off the preview, releasing its button and the keys it holds first. */
  leave() {
    for (const key of [...this.held]) this.keyUp(key);
    if (this.carried) {
      for (const element of this.over) this.sendDrag(element, 'dragleave');
      this.carried = null;
      this.over = [];
      this.at = null;
      return;
    }
    this.release();
    if (this.over[0]) this.send(this.over[0], 'pointerout');
    for (const element of this.over) {
      this.send(element, 'pointerleave');
      mark(element, hoverMark, false);
    }
    this.over = [];
    this.at = null;
  }

  /** Whether the pointer is over the preview. */
  get present() {
    return Boolean(this.at);
  }

  /** Whether its button is pressed. */
  get down() {
    return Boolean(this.buttons);
  }

  dispose() {
    this.endWheel();
    this.focus(null);
    this.leave();
    this.selection.clear();
    captures.delete(this.id);
  }
}

/** The site's rules for :hover and :active, written again for the pointer's marks. */
const mirror = typeof CSSStyleSheet === 'undefined' ? null : new CSSStyleSheet();
let mirroredSheets = -1;

/** Writes a rule's text again inside the group rules around it, such as @media and @layer. */
type Wrap = (text: string) => string;

function mirrorRules(rules: CSSRuleList, out: string[], wrap: Wrap) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      // A rule for what isn't hovered would hold for the marked element still; it is left alone.
      if (
        !/:(hover|active|focus)/.test(selector) ||
        /:not\([^)]*:(hover|active|focus)/.test(selector)
      )
        continue;
      const marked = selector
        .replace(/:hover\b/g, `[${hoverMark}]`)
        .replace(/:active\b/g, `[${pressMark}]`)
        .replace(/:focus-visible\b/g, `[${focusMark}]`)
        .replace(/:focus-within\b/g, `[${focusWithinMark}]`)
        .replace(/:focus\b(?!-)/g, `[${focusMark}]`);
      out.push(wrap(`${marked} { ${rule.style.cssText} }`));
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const at = rule instanceof CSSMediaRule ? '@media' : '@supports';
      mirrorRules(rule.cssRules, out, (text) => wrap(`${at} ${rule.conditionText} { ${text} }`));
    } else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) {
      mirrorRules(rule.cssRules, out, (text) =>
        wrap(`@container ${rule.conditionText} { ${text} }`),
      );
    } else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
      mirrorRules(rule.cssRules, out, (text) => wrap(`@layer ${rule.name} { ${text} }`));
    }
  }
}

/**
 * Gives every :hover and :active rule of the site's stylesheets a twin for the marks of the
 * pointer no one sees, in a sheet of its own after them, so a marked element looks as hovered or
 * pressed as it would under a real pointer. It writes them again when stylesheets are added, as a
 * page's load.
 */
export function mirrorPointerStates() {
  if (!mirror || document.styleSheets.length === mirroredSheets) return;
  mirroredSheets = document.styleSheets.length;
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      mirrorRules(sheet.cssRules, rules, (text) => text);
    } catch {
      // A stylesheet from elsewhere can't be read; the site has none with these states.
    }
  }
  mirror.replaceSync(rules.join('\n'));
  if (!document.adoptedStyleSheets.includes(mirror))
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, mirror];
}

/** Whether an event comes from a pointer no one sees, which a tile's own hover ignores. */
export const isVirtual = (event: { pointerId?: number }) =>
  event.pointerId !== undefined && captures.has(event.pointerId);
