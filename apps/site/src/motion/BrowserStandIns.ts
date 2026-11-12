/*
 * Stand-ins for a few browser methods, so that the components in a stage (a tile's canvas or a
 * page's figure) behave as they would on a page of their own while the site's virtual pointer
 * (VirtualPointer.ts) plays them.
 *
 * useBrowserStandIns, which every stage calls, installs the stand-ins on the page's Element and
 * HTMLElement prototypes when the first stage mounts, and puts the browser's own methods back when
 * the last one unmounts. So a page without a stage, such as a guide, runs on the browser's own
 * methods. Each stand-in changes what a call does only for an element inside a stage, or for one
 * of the virtual pointer's ids, and calls the browser's own method for anything else:
 * - setPointerCapture, releasePointerCapture and hasPointerCapture keep the capture of the virtual
 *   pointers. The browser would throw for their ids, which it doesn't know.
 * - focus, inside a stage that has the virtual keyboard's focus, moves that focus instead, since
 *   the stage is inert. In a live example the reader hasn't touched yet, it does nothing, so an
 *   overlay that opens as the page loads doesn't take the reader's focus and scroll the page.
 * - matches, asked about :focus or :focus-visible inside a stage that has the virtual keyboard's
 *   focus, answers from the virtual pointer's focus mark, as the stage's stylesheets do.
 * - scrollIntoView, inside a stage or an open example, scrolls only the boxes inside it, never the
 *   page around it.
 * Two more apply only during one call: keepClipboard, so a copy button the virtual pointer presses
 * doesn't write to the reader's clipboard, and lendSelection, so a rich text command finds a
 * selection on the page.
 *
 * The state lives on the page's global object, so after a hot reload of this module the new
 * module finds the state that the installed methods read (tests/site/BrowserStandIns.test.ts).
 */
import { useLayoutEffect } from 'react';
import { focusMark } from './pointer/PointerStates';

/** The key of the stand-ins' state on the page's global object, the same for every evaluation. */
const standInsKey = Symbol.for('catalogue-browser-stand-ins');

/** The stages holding a realm's stand-ins: how many there are, and how to remove the stand-ins. */
interface Hold {
  count: number;
  restore: () => void;
}

/**
 * The stand-ins' state, one for the whole page. The methods installed on a realm's prototypes
 * outlive a hot reload of this module, so the module, evaluated again, reads this state rather
 * than starting its own.
 */
interface StandIns {
  /** The ids of the virtual pointers, and the element each has captured, if any. */
  captures: Map<number, Element | null>;
  /**
   * The stages that have the virtual keyboard's focus, by their scope, and what a call to focus an
   * element inside one does instead.
   */
  keyboardFocused: Map<Element, (element: Element) => void>;
  /** The holds on each realm's stand-ins, by the realm's Element prototype. */
  holds: WeakMap<object, Hold>;
}

// The page's global object, which declares no such key: the state is this module's own.
const page = globalThis as { [standInsKey]?: StandIns };
const state: StandIns = (page[standInsKey] ??= {
  captures: new Map(),
  keyboardFocused: new Map(),
  holds: new WeakMap(),
});

export const { captures, keyboardFocused } = state;

/** The elements a stage's own scrolling stays inside: a tile's canvas and a page's figure. */
const stages = '.catalogue-tile-canvas, .site-live-example';

/**
 * The elements an open example's scrolling stays inside where no stage holds it, such as an
 * anatomy figure, and an animated figure's subject, whose menus highlight their items as the
 * virtual pointer moves down them.
 */
const openExamples = '.catalogue-open-example, .catalogue-motion-subject';

/** A live example the reader hasn't touched yet (`data-touched`, OpenExample.tsx). */
const untouchedExample = '.catalogue-open-example[data-live]:not([data-touched])';

/** The prototypes the stand-ins are installed on: the page's, or a test's. */
interface Realm {
  Element: { prototype: Element };
  HTMLElement: { prototype: HTMLElement };
}

/**
 * Installs the stand-ins while the calling stage is mounted: the first stage to mount installs
 * them, and the last one to unmount removes them. It is a layout effect, so the stand-ins are in
 * place before the stage's later effects run, such as an overlay opening or a playback starting.
 */
export function useBrowserStandIns() {
  useLayoutEffect(() => holdBrowserStandIns(), []);
}

/**
 * Holds the stand-ins on a realm's prototypes and returns the release. The first hold installs
 * them; once every hold is released, the browser's own methods are put back. A second release of
 * the same hold does nothing.
 * @internal Also for tests/site/BrowserStandIns.test.ts, which holds them on a realm of its own.
 */
export function holdBrowserStandIns(realm: Realm = globalThis) {
  const element = realm.Element.prototype;
  let hold = state.holds.get(element);
  if (!hold) {
    const restores = [
      keepCaptures(element),
      keepFocus(element, realm.HTMLElement.prototype),
      keepScrollInStages(element),
    ];
    hold = { count: 0, restore: () => restores.forEach((restore) => restore()) };
    state.holds.set(element, hold);
  }
  const held = hold;
  held.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--held.count > 0) return;
    held.restore();
    state.holds.delete(element);
  };
}

/**
 * Replaces methods on an object, such as a prototype, and returns a function that puts back what
 * the object had: its own property, or none where the method was inherited.
 */
function replace<T extends object>(target: T, methods: Partial<T>) {
  // Object.keys types its keys as strings; they are the methods' names.
  const names = Object.keys(methods) as (keyof T & string)[];
  const own = names.map((name) => Object.getOwnPropertyDescriptor(target, name));
  Object.assign(target, methods);
  return () =>
    names.forEach((name, index) => {
      const descriptor = own[index];
      if (descriptor) Object.defineProperty(target, name, descriptor);
      else Reflect.deleteProperty(target, name);
    });
}

/**
 * Keeps pointer capture for the virtual pointers, whose ids the browser would throw for. Only
 * those ids are handled here; a real pointer's capture stays with the browser.
 */
function keepCaptures(proto: Element) {
  const { setPointerCapture, releasePointerCapture, hasPointerCapture } = proto;
  return replace(proto, {
    setPointerCapture(this: Element, id: number) {
      if (!captures.has(id)) return setPointerCapture.call(this, id);
      captures.set(id, this);
    },
    releasePointerCapture(this: Element, id: number) {
      if (!captures.has(id)) return releasePointerCapture.call(this, id);
      if (captures.get(id) === this) captures.set(id, null);
    },
    hasPointerCapture(this: Element, id: number) {
      if (!captures.has(id)) return hasPointerCapture.call(this, id);
      return captures.get(id) === this;
    },
  });
}

/**
 * Keeps focus inside the stage or example that holds it.
 *
 * A stage with the virtual keyboard's focus is inert. When one of its components moves focus, as
 * an arrow key does along tabs, the virtual focus moves instead (KeyboardControl.keyboardFocus).
 * When a component asks whether one of its elements matches :focus or :focus-visible, the answer
 * comes from the virtual focus mark, as the stage's stylesheets read it (mirrorPointerStates).
 *
 * In a live example the reader hasn't touched, focus() does nothing. An overlay pressed open as
 * the page loads, such as a select's list, moves focus to its chosen item, as an opened list does.
 * That would take focus from wherever the reader is, and scroll the page to the example.
 */
function keepFocus(element: Element, html: HTMLElement) {
  const { focus } = html;
  const { matches } = element;
  const restoreFocus = replace(html, {
    focus(this: HTMLElement, options?: FocusOptions) {
      for (const [scope, follow] of keyboardFocused) if (scope.contains(this)) return follow(this);
      if (this.closest(untouchedExample)) return;
      return focus.call(this, options);
    },
  });
  const restoreMatches = replace(element, {
    // One signature for matches' overloads by tag name, which only narrow the element's type.
    matches: function (this: Element, selectors: string) {
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
    } as typeof matches,
  });
  return () => {
    restoreFocus();
    restoreMatches();
  };
}

/** Whether a box scrolls vertically: its content is taller than it and its overflow scrolls. */
const scrollsDown = (box: Element) =>
  box.scrollHeight > box.clientHeight &&
  /auto|scroll|overlay/.test(getComputedStyle(box).overflowY);
/** Whether a box scrolls horizontally: its content is wider than it and its overflow scrolls. */
const scrollsAcross = (box: Element) =>
  box.scrollWidth > box.clientWidth && /auto|scroll|overlay/.test(getComputedStyle(box).overflowX);

/**
 * How far a box scrolls along one axis to bring a span into view. `start` and `end` are the
 * span's edges, `from` and `to` the box's, and `place` the alignment scrollIntoView takes.
 */
function scrollFor(start: number, end: number, from: number, to: number, place: string) {
  if (place === 'start') return start - from;
  if (place === 'end') return end - to;
  if (place === 'center') return (start + end) / 2 - (from + to) / 2;
  // Nearest: as little as brings it in, and nothing where it is in view already.
  if (start < from) return start - from;
  if (end > to) return Math.min(end - to, start - from);
  return 0;
}

/**
 * A box's scrollport on the page, the edges scrollIntoView aligns to: inside its borders and
 * scrollbars.
 */
function scrollport(box: Element) {
  const { top, left } = box.getBoundingClientRect();
  const from = { top: top + box.clientTop, left: left + box.clientLeft };
  return { ...from, bottom: from.top + box.clientHeight, right: from.left + box.clientWidth };
}

/** The block alignment scrollIntoView takes from its argument. */
const blockOf = (options?: boolean | ScrollIntoViewOptions): ScrollLogicalPosition =>
  typeof options === 'object' ? (options.block ?? 'start') : options === false ? 'end' : 'start';

/**
 * Keeps scrollIntoView inside the stage or open example the element is in, such as the chosen row
 * of a select resting open in a gallery tile. The browser's own scrollIntoView scrolls every box
 * around the element, the page included: a tile below the fold would pull the page down to it as
 * it appears, and an example opened partway down the page would scroll the page to itself. In a
 * stage, the boxes inside it scroll as the browser would scroll them, along both axes. In an open
 * example outside a stage, only the boxes inside it that scroll vertically scroll, such as a
 * popup's list.
 */
function keepScrollInStages(proto: Element) {
  const { scrollIntoView } = proto;
  return replace(proto, {
    scrollIntoView(this: Element, options?: boolean | ScrollIntoViewOptions) {
      const stage = this.closest(stages);
      if (stage) return scrollInStage(this, stage, options);
      const example = this.closest(openExamples);
      if (example) return scrollInExample(this, example, options);
      return scrollIntoView.call(this, options);
    },
  });
}

function scrollInStage(target: Element, stage: Element, options?: boolean | ScrollIntoViewOptions) {
  const block = blockOf(options);
  const inline = typeof options === 'object' ? (options.inline ?? 'nearest') : 'nearest';
  for (let box = target.parentElement; box && stage.contains(box); box = box.parentElement) {
    const down = scrollsDown(box);
    const across = scrollsAcross(box);
    if (!down && !across) continue;
    const shown = scrollport(box);
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
    if (!scrollsDown(box)) continue;
    const shown = scrollport(box);
    const item = target.getBoundingClientRect();
    box.scrollBy({
      top: scrollFor(item.top, item.bottom, shown.top, shown.bottom, block),
      behavior: 'instant',
    });
  }
}

/**
 * Runs a click with the reader's clipboard left as it is, so a stage's copy button that the
 * virtual pointer presses copies nothing. The clipboard's writes still resolve, so the button
 * shows that it copied.
 */
export function keepClipboard(click: () => void) {
  // Absent outside a secure context, though the DOM's types always have it.
  const clipboard = navigator.clipboard as Clipboard | undefined;
  if (!clipboard) return click();
  const restore = replace(clipboard, {
    writeText: () => Promise.resolve(),
    write: () => Promise.resolve(),
  });
  try {
    click();
  } finally {
    restore();
  }
}

/**
 * Runs what a key does in a rich text editor with the page's selection lent to the stage. The
 * selection is placed at the start of `scope`, outside the editor, so nothing takes focus, and
 * afterwards it is put back as the reader left it. A command that reads the page's selection, such
 * as inserting a reference, then finds one, as it would in a focused editor. Without this it finds
 * none, since nothing in an inert stage holds the page's selection.
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
