/*
 * The site's stand-ins for browser methods, installed once as it starts (installBrowserStandIns,
 * main.tsx), so a stage's components answer as they would on a page of their own: the pointer no
 * one sees (VirtualPointer.ts) captures and focuses as a person's would, a component's scrolling
 * into view stays inside its stage, and a live example keeps its focus to itself until the reader
 * reaches for it. Outside what each stands in for, the method is the browser's own. Here too, run
 * for one call, the clipboard a copy button writes to and the page's selection a rich text command
 * reads (tests/site/BrowserStandIns.test.mjs).
 */
import { focusMark } from './pointer/PointerStates';

/** Where the page keeps the stand-ins' state, the same for every evaluation of this module. */
const standInsKey = Symbol.for('catalogue-browser-stand-ins');

/**
 * What the stand-ins keep, in one place for the whole page: the wrappers installed on a realm's
 * prototypes live on across a hot reload of this module, so the module, evaluated again, finds the
 * state they read rather than starting its own.
 */
interface StandIns {
  /** The ids of the pointers no one sees, and what each has captured. */
  captures: Map<number, Element | null>;
  /** The stages the keyboard's focus is in, by their scope, and what follows a move of it there. */
  keyboardFocused: Map<Element, (element: Element) => void>;
  /** The realms' Element prototypes that have the stand-ins. */
  installed: WeakSet<object>;
}

// The page's global object, which declares no such key: the state is this module's own.
const page = globalThis as { [standInsKey]?: StandIns };
const state: StandIns = (page[standInsKey] ??= {
  captures: new Map(),
  keyboardFocused: new Map(),
  installed: new WeakSet(),
});

export const { captures, keyboardFocused } = state;

/** What a stage's own scrolling stays inside: a tile's window and a page's figure. */
const stages = '.catalogue-tile-canvas, .site-live-example';

/**
 * What an open example's scrolling stays inside where no stage holds it, such as in an anatomy
 * figure, and an animated figure's, whose menus highlight their items as its pointer runs down them.
 */
const openExamples = '.catalogue-open-example, .catalogue-motion-subject';

/** A live example the reader hasn't reached for yet (`data-touched`, OpenExample.tsx). */
const untouchedExample = '.catalogue-open-example[data-live]:not([data-touched])';

/** The prototypes the stand-ins are installed on: the page's, or a test's. */
interface Realm {
  Element: { prototype: Element };
  HTMLElement: { prototype: HTMLElement };
}

/**
 * Installs the stand-ins on a realm's prototypes, once: a second call changes nothing. Each wraps
 * the browser's own method and calls it for anything it doesn't stand in for.
 */
export function installBrowserStandIns(realm: Realm = globalThis) {
  const element = realm.Element.prototype;
  if (state.installed.has(element)) return;
  state.installed.add(element);
  keepCaptures(element);
  keepFocus(element, realm.HTMLElement.prototype);
  keepScrollInStages(element);
}

/**
 * Keeps a pointer's capture for the pointers no one sees: the browser throws for an id it doesn't
 * know. Only those ids are kept here; a real pointer's capture is the browser's.
 */
function keepCaptures(proto: Element) {
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

/**
 * Keeps focus where a stage or an example holds it. Inside a stage the keyboard's focus is in,
 * which is inert, where one of its components moves focus, as an arrow key along tabs does, the
 * pointer's focus follows instead (VirtualPointer.keyboardFocus), and a component asking whether an
 * element of it matches :focus or :focus-visible is answered by the pointer's mark, as its
 * stylesheets are (mirrorPointerStates). In a live example the reader hasn't reached for, a call
 * to focus an element does nothing: an overlay pressed open as the page loads, such as a select's
 * list, moves focus to its chosen item as an opened list does, which would take focus from the
 * page, and scroll it, wherever the reader was.
 */
function keepFocus(element: Element, html: HTMLElement) {
  const { focus } = html;
  html.focus = function (this: HTMLElement, options?: FocusOptions) {
    for (const [scope, follow] of keyboardFocused) if (scope.contains(this)) return follow(this);
    if (this.closest(untouchedExample)) return;
    return focus.call(this, options);
  };
  const { matches } = element;
  element.matches = function (this: Element, selectors: string) {
    if (selectors.includes(':focus'))
      for (const scope of keyboardFocused.keys())
        if (scope.contains(this))
          return matches.call(
            this,
            selectors
              .replace(/:focus-visible\b/g, `[${focusMark}]`)
              .replace(/:focus\b(?!-)/g, `[${focusMark}]`),
          );
    return matches.call(this, selectors);
  } as typeof matches;
}

/** Whether a box scrolls along the block axis, its content taller than it. */
const scrollsDown = (box: Element) =>
  box.scrollHeight > box.clientHeight &&
  /auto|scroll|overlay/.test(getComputedStyle(box).overflowY);
/** Whether a box scrolls along the inline axis, its content wider than it. */
const scrollsAcross = (box: Element) =>
  box.scrollWidth > box.clientWidth && /auto|scroll|overlay/.test(getComputedStyle(box).overflowX);

/** How far a box scrolls along an axis to bring a span into it, by where it is to show there. */
function scrollFor(start: number, end: number, from: number, to: number, place: string) {
  if (place === 'start') return start - from;
  if (place === 'end') return end - to;
  if (place === 'center') return (start + end) / 2 - (from + to) / 2;
  // Nearest: as little as brings it in, none where it is in already.
  if (start < from) return start - from;
  if (end > to) return Math.min(end - to, start - from);
  return 0;
}

/**
 * How far a box scrolls to show an item it holds, by the item's `block` alignment as
 * scrollIntoView takes it; `nearest` scrolls only as far as the item needs.
 */
function scrollDelta(item: DOMRect, box: Element, block: ScrollLogicalPosition) {
  const top = item.top - box.getBoundingClientRect().top - box.clientTop;
  const bottom = top + item.height;
  if (block === 'start') return top;
  if (block === 'end') return bottom - box.clientHeight;
  if (block === 'center') return (top + bottom - box.clientHeight) / 2;
  if (top < 0) return top;
  return Math.max(0, bottom - box.clientHeight);
}

/** The block alignment scrollIntoView takes from its argument. */
const blockOf = (options?: boolean | ScrollIntoViewOptions): ScrollLogicalPosition =>
  typeof options === 'object' ? (options.block ?? 'start') : options === false ? 'end' : 'start';

/**
 * Keeps what a component scrolls into view inside the stage or the open example it is in, such
 * as the chosen row of a select resting open in a gallery tile: the browser's own scrollIntoView
 * scrolls every box around the element, the page among them, so a tile loaded below the fold would
 * pull the page down to it as it appears, and a page with an example opened partway down, wherever
 * the example was. In a stage, the boxes that scroll inside it scroll as the browser would scroll
 * them, along both axes; in an open example elsewhere, the boxes inside it that scroll down, such
 * as a popup's list.
 */
function keepScrollInStages(proto: Element) {
  const { scrollIntoView } = proto;
  proto.scrollIntoView = function (this: Element, options?: boolean | ScrollIntoViewOptions) {
    const stage = this.closest(stages);
    if (stage) return scrollInStage(this, stage, options);
    const example = this.closest(openExamples);
    if (example) return scrollInExample(this, example, options);
    return scrollIntoView.call(this, options);
  };
}

function scrollInStage(target: Element, stage: Element, options?: boolean | ScrollIntoViewOptions) {
  const block = blockOf(options);
  const inline = typeof options === 'object' ? (options.inline ?? 'nearest') : 'nearest';
  for (let box = target.parentElement; box && stage.contains(box); box = box.parentElement) {
    const down = scrollsDown(box);
    const across = scrollsAcross(box);
    if (!down && !across) continue;
    const shown = box.getBoundingClientRect();
    const item = target.getBoundingClientRect();
    box.scrollBy({
      top: down ? scrollFor(item.top, item.bottom, shown.top, shown.bottom, block) : 0,
      left: across ? scrollFor(item.left, item.right, shown.left, shown.right, inline) : 0,
      behavior: 'instant',
    });
  }
}

function scrollInExample(
  target: Element,
  example: Element,
  options?: boolean | ScrollIntoViewOptions,
) {
  const block = blockOf(options);
  for (let box = target.parentElement; box && box !== example; box = box.parentElement) {
    if (box.scrollHeight <= box.clientHeight) continue;
    if (!/auto|scroll/.test(getComputedStyle(box).overflowY)) continue;
    box.scrollTop += scrollDelta(target.getBoundingClientRect(), box, block);
  }
}

/**
 * Runs a click with the reader's clipboard kept as it is: a stage's copy button, pressed by the
 * pointer no one sees, copies nowhere. Its writes resolve, so it shows that it copied.
 */
export function keepClipboard(click: () => void) {
  // Absent outside a secure context, though the DOM's types always have it.
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
      // Its own property, which the clipboard's type doesn't index.
      else delete (clipboard as unknown as Record<string, unknown>)[name];
    });
  }
}

/**
 * Runs what a key does in a rich text editor with the page's selection lent to the stage, at its
 * start, outside the editor, so nothing takes focus, and then given back as the reader left it: a
 * command that reads the page's selection, such as inserting a reference, finds one, as it would
 * in a focused editor, though nothing in an inert stage holds the page's selection.
 */
export function lendSelection(scope: Element | undefined, run: () => void) {
  const selection = scope ? window.getSelection() : null;
  if (!scope || !selection) return run();
  const kept = Array.from({ length: selection.rangeCount }, (_, index) =>
    selection.getRangeAt(index),
  );
  const range = document.createRange();
  range.setStart(scope, 0);
  selection.removeAllRanges();
  selection.addRange(range);
  try {
    run();
  } finally {
    selection.removeAllRanges();
    for (const each of kept) selection.addRange(each);
  }
}
