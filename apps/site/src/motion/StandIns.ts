/*
 * Stand-ins for what the browser keeps only for a real pointer, so a preview's components answer
 * the pointer no one sees (VirtualPointer.ts) as they would a person: its pointer capture, the
 * keyboard's focus inside an inert preview, the clipboard a copy button writes to, and the page's
 * selection a rich text command reads. Elsewhere each is the browser's, as before.
 */
import { focusMark } from './PointerStates';

/** The ids of the pointers no one sees, and what each has captured. */
export const captures = new Map<number, Element | null>();

/**
 * Keeps a pointer's capture for the pointers no one sees: the browser throws for an id it doesn't
 * know. Only those ids are kept here; a real pointer's capture is the browser's, as before.
 */
export function keepCaptures() {
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

/** The previews the keyboard's focus is in, by their scope, and what follows a move of it there. */
export const keyboardFocused = new Map<Element, (element: Element) => void>();

/**
 * Keeps the keyboard's focus inside a preview that has it: the preview is inert, so where one of
 * its components moves focus, as an arrow key along tabs does, the pointer's focus follows
 * instead (VirtualPointer.keyboardFocus), and a component asking whether an element of it matches
 * :focus or :focus-visible is answered by the pointer's mark, as its stylesheets are
 * (mirrorPointerStates). Elsewhere, focus is the browser's, as before.
 */
export function keepFocus() {
  const proto = HTMLElement.prototype;
  if ((proto as { catalogueFocus?: boolean }).catalogueFocus) return;
  (proto as { catalogueFocus?: boolean }).catalogueFocus = true;
  const { focus } = proto;
  proto.focus = function (options?: FocusOptions) {
    for (const [scope, follow] of keyboardFocused) if (scope.contains(this)) return follow(this);
    return focus.call(this, options);
  };
  const { matches } = Element.prototype;
  Element.prototype.matches = function (this: Element, selectors: string) {
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

/**
 * Runs a click with the reader's clipboard kept as it is: a preview's copy button, pressed by the
 * pointer no one sees, copies nowhere. Its writes resolve, so it shows that it copied.
 */
export function keepClipboard(click: () => void) {
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

/**
 * Runs what a key does in a rich text editor with the page's selection lent to the preview, at its
 * start, outside the editor, so nothing takes focus, and then given back as the reader left it: a
 * command that reads the page's selection, such as inserting a reference, finds one, as it would
 * in a focused editor, though nothing in an inert preview holds the page's selection.
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

/** What a preview's own scrolling stays inside: a tile's window and a page's figure. */
const previews = '.catalogue-related-canvas, .site-live-example';

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
 * Keeps what a component scrolls into view inside the preview it is in, such as the chosen row of
 * a select resting open in a gallery tile: the boxes that scroll inside the preview scroll as the
 * browser would scroll them, and the page never does. The browser's own scrollIntoView scrolls
 * every box around the element, the page among them, so a tile loaded below the fold would pull
 * the page down to it as it appears. Elsewhere, scrolling into view is the browser's, as before.
 */
export function keepScrollInPreviews() {
  const proto = Element.prototype;
  if ((proto as { catalogueScroll?: boolean }).catalogueScroll) return;
  (proto as { catalogueScroll?: boolean }).catalogueScroll = true;
  const { scrollIntoView } = proto;
  proto.scrollIntoView = function (options?: boolean | ScrollIntoViewOptions) {
    const preview = this.closest(previews);
    if (!preview) return scrollIntoView.call(this, options);
    const block =
      typeof options === 'object'
        ? (options.block ?? 'start')
        : options === false
          ? 'end'
          : 'start';
    const inline = typeof options === 'object' ? (options.inline ?? 'nearest') : 'nearest';
    for (let box = this.parentElement; box && preview.contains(box); box = box.parentElement) {
      const down = scrollsDown(box);
      const across = scrollsAcross(box);
      if (!down && !across) continue;
      const shown = box.getBoundingClientRect();
      const target = this.getBoundingClientRect();
      box.scrollBy({
        top: down ? scrollFor(target.top, target.bottom, shown.top, shown.bottom, block) : 0,
        left: across ? scrollFor(target.left, target.right, shown.left, shown.right, inline) : 0,
        behavior: 'instant',
      });
    }
  };
}
