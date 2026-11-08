'use client';

import { useEffect } from 'react';
import { reducedMotionQuery } from '../../internal/reducedMotion.js';

/** Roles of widgets that handle the scrolling keys themselves. */
const widgetRoles = [
  'tree',
  'treeitem',
  'treegrid',
  'grid',
  'gridcell',
  'listbox',
  'option',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tablist',
  'tab',
  'slider',
  'spinbutton',
  'radiogroup',
  'radio',
  'combobox',
  'scrollbar',
  'textbox',
  'searchbox',
];
const widgetSelector = [
  'input',
  'textarea',
  'select',
  // Media controls and embedded content use the keys themselves.
  'audio[controls]',
  'video[controls]',
  'iframe',
  'embed',
  'object',
  ...widgetRoles.map((role) => `[role="${role}"]`),
].join(', ');
/** Elements that can take focus themselves. */
const focusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'embed',
  'object',
  '[tabindex]',
  '[contenteditable]',
].join(', ');
/** Controls that Space activates, so it does not scroll from them. Links follow Enter only. */
const spaceSelector = 'button, summary, [role="button"], [role="checkbox"], [role="switch"]';
/** Keys that only change others, which do not end a run of presses. */
const modifierKeys = new Set(['Shift', 'Control', 'Alt', 'Meta']);

/** Pixels per arrow key press, as browsers scroll a page. */
const lineStep = 40;
/** The share of the visible height a page key scrolls, keeping some context in view. */
const pageShare = 0.875;

interface ScrollStep {
  /** -1 toward the start, 1 toward the end. */
  direction: -1 | 1;
  /** Scroll by this amount, or to an edge when undefined. */
  by?: number;
}

function scrollStep(event: KeyboardEvent, scroller: HTMLElement): ScrollStep | null {
  const page = scroller.clientHeight * pageShare;
  if (event.key === ' ')
    return event.shiftKey ? { direction: -1, by: -page } : { direction: 1, by: page };
  if (event.shiftKey) return null;
  switch (event.key) {
    case 'PageDown':
      return { direction: 1, by: page };
    case 'PageUp':
      return { direction: -1, by: -page };
    case 'ArrowDown':
      return { direction: 1, by: lineStep };
    case 'ArrowUp':
      return { direction: -1, by: -lineStep };
    case 'End':
      return { direction: 1 };
    case 'Home':
      return { direction: -1 };
    default:
      return null;
  }
}

function isElement(node: EventTarget | null): node is Element {
  // Any target, read for its node type.
  return (node as Node | null)?.nodeType === Node.ELEMENT_NODE;
}

/** An element and its ancestors, across shadow roots, as an event's composed path lists them. */
function ancestors(element: Element) {
  const chain: Element[] = [];
  let node: Node | null = element;
  while (node) {
    if (isElement(node)) chain.push(node);
    node =
      node.parentNode ??
      // A fragment with no parent is a shadow root.
      (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (node as ShadowRoot).host : null);
  }
  return chain;
}

/**
 * Whether what has focus inside an element is out of sight: a shadow host, whose shadow root may be
 * closed, as in any custom element. An element that cannot take focus itself, such as a span, only
 * passes on a key from its closed shadow root; browsers let a scroll area take focus without a
 * tabindex, so it is not one.
 */
function hidesFocus(element: Element, view: Window) {
  if (element.shadowRoot !== null || element.localName.includes('-')) return true;
  if ((element as HTMLElement).tabIndex >= 0 || element.matches(focusableSelector)) return false;
  const { overflowX, overflowY } = view.getComputedStyle(element);
  return !/^(auto|scroll)$/.test(overflowX) && !/^(auto|scroll)$/.test(overflowY);
}

/** How far an element can still scroll that way. */
function room(element: Element, direction: -1 | 1) {
  return direction > 0
    ? element.scrollHeight - element.clientHeight - element.scrollTop
    : element.scrollTop;
}

/**
 * Where a region below a title bar scrolls instead of the document, the keyboard scrolls it as a
 * browser scrolls a page: Page Up and Page Down, Space and Shift+Space, Home, End and the up and
 * down arrows. With focus in the region the browser scrolls it; these keys come from the document
 * and from controls outside the region that leave the key alone. Fields, widgets that use the keys,
 * media controls, elements that hold focus out of sight (web components, or any element with a
 * closed shadow root), anything that scrolls that way itself and keys that the page handled first
 * keep them; with focus on the document, so does an
 * area that scrolls where the pointer last pressed, as browsers scroll that area. As in the
 * browser, quick presses add up and a held key repeats at once.
 *
 * The keys are heard on the window, after the page's elements and its document: a handler there
 * that calls preventDefault keeps its key, as does a window listener added before the region
 * mounts. A window listener added later hears the key after this one.
 */
export function useScrollKeys(root: HTMLElement | null, scroller: HTMLElement | null) {
  useEffect(() => {
    const view = root?.ownerDocument.defaultView;
    if (!root || !scroller || !view) return;
    return listenForScrollKeys(root, scroller, view);
  }, [root, scroller]);
}

/** Scrolls the region with the keyboard until the returned function is called. */
function listenForScrollKeys(root: HTMLElement, scroller: HTMLElement, view: Window) {
  const document = root.ownerDocument;
  const reducedMotion = reducedMotionQuery(view);
  // Where the smooth scroll of the last key is heading. The next key continues from there, so
  // quick presses add up; the end of the scroll and any other input clear it.
  let destination: number | null = null;
  // Where the pointer last pressed: with focus on the document, browsers scroll that area.
  let pressed: Element | null = null;

  function scrollsThatWay(element: Element, direction: -1 | 1) {
    return (
      /^(auto|scroll)$/.test(view.getComputedStyle(element).overflowY) &&
      room(element, direction) > 1
    );
  }

  /** Whether the region takes the key, rather than the browser or the focused control. */
  function claims(event: KeyboardEvent, direction: -1 | 1) {
    // A document that still scrolls, such as a page showing the frame in a smaller area, keeps
    // its keys.
    const page = document.scrollingElement;
    if (page && room(page, direction) > 1) return false;
    // The composed path reaches into web components, such as a field in a shadow root.
    const chain = event.composedPath().filter(isElement);
    const focused = chain[0];
    if (!focused) return false;
    const onDocument = focused === document.body || focused === document.documentElement;
    const origin = onDocument ? (pressed?.isConnected ? ancestors(pressed) : []) : chain;
    // The browser scrolls the region from focus or the last press inside it.
    if (origin.includes(scroller)) return false;
    if (!onDocument) {
      // Focus outside the root, such as in a dialog, belongs elsewhere.
      const end = chain.indexOf(root);
      if (end === -1) return false;
      // Where the path ends at an element that holds focus out of sight, such as one with a field
      // in a closed shadow root, the key may be typed; it stays with the browser.
      if (hidesFocus(focused, view)) return false;
      for (const element of chain.slice(0, end)) {
        if (element.matches(widgetSelector) || (element as HTMLElement).isContentEditable)
          return false;
        if (event.key === ' ' && element.matches(spaceSelector)) return false;
      }
    }
    return !origin.some((element) => scrollsThatWay(element, direction));
  }

  function onKeyDown(event: KeyboardEvent) {
    const step =
      event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
        ? null
        : scrollStep(event, scroller);
    if (!step || !claims(event, step.direction)) {
      if (!modifierKeys.has(event.key)) destination = null;
      return;
    }
    event.preventDefault();
    const end = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const from = Math.min(Math.max(destination ?? scroller.scrollTop, 0), end);
    const top =
      step.by === undefined
        ? step.direction > 0
          ? end
          : 0
        : Math.min(Math.max(from + step.by, 0), end);
    // A held key repeats faster than a smooth scroll settles, so its repeats scroll at once.
    const smooth = !event.repeat && !reducedMotion?.matches;
    destination = smooth && Math.abs(top - scroller.scrollTop) >= 1 ? top : null;
    scroller.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
  }
  function onPointerDown(event: PointerEvent) {
    const target = event.composedPath()[0] ?? null;
    pressed = isElement(target) ? target : null;
    destination = null;
  }
  function forget() {
    destination = null;
  }

  // Other input is noted before the page handles it, without delaying it.
  const early = { capture: true, passive: true };
  view.addEventListener('keydown', onKeyDown);
  view.addEventListener('pointerdown', onPointerDown, early);
  view.addEventListener('wheel', forget, early);
  view.addEventListener('touchstart', forget, early);
  scroller.addEventListener('scrollend', forget);
  return () => {
    view.removeEventListener('keydown', onKeyDown);
    view.removeEventListener('pointerdown', onPointerDown, early);
    view.removeEventListener('wheel', forget, early);
    view.removeEventListener('touchstart', forget, early);
    scroller.removeEventListener('scrollend', forget);
  };
}
