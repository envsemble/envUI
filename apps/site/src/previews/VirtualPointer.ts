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

/** A point of the pointer's, in the viewport's coordinates. */
interface Point {
  x: number;
  y: number;
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

/** Fields a press focuses, as typing goes into them. */
const textFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"]), textarea, [contenteditable="true"]';

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

  constructor(private readonly scope: Element) {
    keepCaptures();
    captures.set(this.id, null);
    mirrorPointerStates();
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
      if (style.visibility === 'hidden' && getComputedStyle(this.scope).visibility !== 'hidden')
        continue;
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
      ...init,
    };
    const sent = target.dispatchEvent(new PointerEvent(type, options));
    // A press the page takes for itself, by preventing its default, sends no mouse events after.
    if (type === 'pointerdown') this.mouseless = !sent;
    const twin = mouseTwin[type];
    if (twin && !(this.mouseless && /down|move|up/.test(twin)))
      target.dispatchEvent(new MouseEvent(twin, options));
    return sent;
  }

  /** A file the pointer carries in from outside, as a drag from the desktop does. */
  private carried: DataTransfer | null = null;

  /** Picks up a file, as a person drags one in from the desktop: its moves are a drag now. */
  carry(name: string, type: string) {
    this.carried = new DataTransfer();
    this.carried.items.add(new File(['envUI'], name, { type }));
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
    const first = !this.at;
    this.at = point;
    const target = this.hit(point);
    const chain = this.chain(target);
    const left = this.over.filter((element) => !chain.includes(element));
    const entered = chain.filter((element) => !this.over.includes(element));
    if (left.length && this.over[0]) this.send(this.over[0], 'pointerout');
    for (const element of left) {
      this.send(element, 'pointerleave');
      mark(element, hoverMark, false);
    }
    if (entered.length || first) this.send(target, 'pointerover');
    for (const element of entered.reverse()) {
      mark(element, hoverMark, true);
      this.send(element, 'pointerenter');
    }
    this.over = chain;
    this.send(captures.get(this.id) ?? target, 'pointermove');
  }

  /** Whether this pointer may go on now: no other is holding its button down on the page. */
  get canPress() {
    return pressing === null || pressing === this.id;
  }

  /** Presses the pointer's button where it is. */
  press() {
    const target = this.over[0];
    if (!target || this.buttons) return;
    pressing = this.id;
    this.buttons = 1;
    this.send(target, 'pointerdown', { button: 0 });
    this.pressed = [...this.over];
    for (const element of this.pressed) mark(element, pressMark, true);
    // A press in a field focuses it, and anywhere else takes focus from the field. A button keeps
    // no focus ring under a pointer, so it isn't marked.
    this.focus(target.closest(textFields));
  }

  /** Releases the button: the press ends, and where it ends on what it began on, it clicks. */
  release() {
    if (!this.buttons) return;
    this.buttons = 0;
    if (pressing === this.id) pressing = null;
    const captured = captures.get(this.id);
    const target = captured ?? this.over[0] ?? this.scope;
    this.send(target, 'pointerup', { button: 0 });
    if (captured) {
      captures.set(this.id, null);
      captured.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: this.id }));
    }
    // A click goes to the nearest element the press and the release share.
    const shared = this.pressed.find((element) => this.over.includes(element));
    if (shared) {
      const point = this.at ?? { x: 0, y: 0 };
      shared.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: 1,
          button: 0,
          clientX: point.x,
          clientY: point.y,
          view: window,
        }),
      );
    }
    for (const element of this.pressed) mark(element, pressMark, false);
    this.pressed = [];
    this.mouseless = false;
  }

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
    const key = text ?? 'Backspace';
    const keyboard = { key, bubbles: true, cancelable: true, composed: true };
    if (!field.dispatchEvent(new KeyboardEvent('keydown', keyboard))) return;
    const value = text === null ? field.value.slice(0, -1) : field.value + text;
    // The value's own setter, under React's, so React sees the change as typing.
    const prototype =
      field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(field, value);
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

  /** Presses a key on an element of the preview, or on the field typed into. */
  key(key: string, selector?: string) {
    const target = (selector && this.scope.querySelector(selector)) || this.focused || this.scope;
    const keyboard = { key, bubbles: true, cancelable: true, composed: true };
    target.dispatchEvent(new KeyboardEvent('keydown', keyboard));
    target.dispatchEvent(new KeyboardEvent('keyup', keyboard));
  }

  /** Takes the pointer off the preview, releasing it first. */
  leave() {
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
    this.focus(null);
    this.leave();
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
