import { useEffect } from 'react';

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
  '[contenteditable]:not([contenteditable="false"])',
  ...widgetRoles.map((role) => `[role="${role}"]`),
].join(', ');
/** Controls that Space activates, so it does not scroll from them. */
const spaceSelector =
  'button, a[href], summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"]';

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

/** Whether an element, or one of its ancestors inside the root, can scroll that way itself. */
function scrollsItself(element: Element, root: Element, direction: -1 | 1) {
  for (let node: Element | null = element; node && node !== root; node = node.parentElement) {
    if (!/^(auto|scroll)$/.test(getComputedStyle(node).overflowY)) continue;
    const room =
      direction > 0 ? node.scrollHeight - node.clientHeight - node.scrollTop : node.scrollTop;
    if (room > 1) return true;
  }
  return false;
}

/**
 * Where a region below a title bar scrolls instead of the document, the keyboard scrolls it as a
 * browser scrolls a page: Page Up and Page Down, Space and Shift+Space, Home, End and the up and
 * down arrows, while focus is on the document, the root or the region itself, or on a control
 * outside the region that leaves the key alone. Keys that the page handled, editable fields,
 * widgets that use the keys and anything that scrolls itself keep them.
 */
export function useScrollKeys(root: HTMLElement | null, scroller: HTMLElement | null) {
  useEffect(() => {
    if (!root || !scroller) return;
    const document = root.ownerDocument;
    const view = document.defaultView;
    if (!view) return;
    const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
    // A document that still scrolls, such as a page showing the frame in a smaller area, keeps its
    // own keys.
    function documentScrolls(direction: -1 | 1) {
      const page = document.scrollingElement;
      if (!page) return false;
      const room =
        direction > 0 ? page.scrollHeight - page.clientHeight - page.scrollTop : page.scrollTop;
      return room > 1;
    }
    function claims(target: Element, event: KeyboardEvent, direction: -1 | 1) {
      if (target === document.body || target === document.documentElement)
        return !documentScrolls(direction);
      if (target === root || target === scroller) return true;
      // Focus inside the region already scrolls it; focus outside the root, such as in a dialog,
      // belongs elsewhere.
      if (!root!.contains(target) || scroller!.contains(target)) return false;
      if (target.closest(widgetSelector)) return false;
      if (event.key === ' ' && target.closest(spaceSelector)) return false;
      return !scrollsItself(target, root!, direction);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const step = scrollStep(event, scroller!);
      const target = event.target instanceof Element ? event.target : null;
      if (!step || !target || !claims(target, event, step.direction)) return;
      event.preventDefault();
      const behavior = reducedMotion.matches ? 'auto' : 'smooth';
      if (step.by === undefined)
        scroller!.scrollTo({ top: step.direction > 0 ? scroller!.scrollHeight : 0, behavior });
      else scroller!.scrollBy({ top: step.by, behavior });
    }
    // The window hears a key after the page's elements and its document, so keys that their
    // handlers took, such as application shortcuts on the document, stay theirs.
    view.addEventListener('keydown', onKeyDown);
    return () => view.removeEventListener('keydown', onKeyDown);
  }, [root, scroller]);
}
