import { useLayoutEffect } from 'react';
import { focusMark } from './pointer/PointerStates';

const standInsKey = Symbol.for('catalogue-browser-stand-ins');

interface Hold {
  count: number;
  restore: () => void;
}

interface StandIns {
  captures: Map<number, Element | null>;
  keyboardFocused: Map<Element, (element: Element) => void>;
  holds: WeakMap<object, Hold>;
}

const page = globalThis as { [standInsKey]?: StandIns };
const state: StandIns = (page[standInsKey] ??= {
  captures: new Map(),
  keyboardFocused: new Map(),
  holds: new WeakMap(),
});

export const { captures, keyboardFocused } = state;

const stages = '.catalogue-tile-canvas, .site-live-example';

const openExamples = '.catalogue-open-example, .catalogue-motion-subject';

const untouchedExample = '.catalogue-open-example[data-live]:not([data-touched])';

interface Realm {
  Element: { prototype: Element };
  HTMLElement: { prototype: HTMLElement };
}

export function useBrowserStandIns() {
  useLayoutEffect(() => holdBrowserStandIns(), []);
}

/** @internal */
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

function replace<T extends object>(target: T, methods: Partial<T>) {
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

const scrollsDown = (box: Element) =>
  box.scrollHeight > box.clientHeight &&
  /auto|scroll|overlay/.test(getComputedStyle(box).overflowY);
const scrollsAcross = (box: Element) =>
  box.scrollWidth > box.clientWidth && /auto|scroll|overlay/.test(getComputedStyle(box).overflowX);

function scrollFor(start: number, end: number, from: number, to: number, place: string) {
  if (place === 'start') return start - from;
  if (place === 'end') return end - to;
  if (place === 'center') return (start + end) / 2 - (from + to) / 2;
  if (start < from) return start - from;
  if (end > to) return Math.min(end - to, start - from);
  return 0;
}

function scrollport(box: Element) {
  const { top, left } = box.getBoundingClientRect();
  const from = { top: top + box.clientTop, left: left + box.clientLeft };
  return { ...from, bottom: from.top + box.clientHeight, right: from.left + box.clientWidth };
}

const blockOf = (options?: boolean | ScrollIntoViewOptions): ScrollLogicalPosition =>
  typeof options === 'object' ? (options.block ?? 'start') : options === false ? 'end' : 'start';

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

export function keepClipboard(click: () => void) {
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
