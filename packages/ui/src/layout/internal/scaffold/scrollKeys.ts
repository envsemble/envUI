import { reducedMotionQuery } from '../../../internal/motion/reducedMotion.js';

const rolesThatHandleScrollKeys = [
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
const mediaControlsAndEmbeddedContent = [
  'audio[controls]',
  'video[controls]',
  'iframe',
  'embed',
  'object',
];
const handlesScrollKeysSelector = [
  'input',
  'textarea',
  'select',
  ...mediaControlsAndEmbeddedContent,
  ...rolesThatHandleScrollKeys.map((role) => `[role="${role}"]`),
].join(', ');
const focusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  ...mediaControlsAndEmbeddedContent,
  '[tabindex]',
  '[contenteditable]',
].join(', ');
const activatedBySpaceSelector =
  'button, summary, [role="button"], [role="checkbox"], [role="switch"]';
const modifierOnlyKeys = new Set(['Shift', 'Control', 'Alt', 'Meta']);

const arrowKeyStepPx = 40;
const pageKeyShareOfVisibleHeight = 0.875;

/** What the region reads of a key press: an event, or one kept from before this code loaded. */
export type ScrollKey = Pick<
  KeyboardEvent,
  | 'key'
  | 'shiftKey'
  | 'altKey'
  | 'ctrlKey'
  | 'metaKey'
  | 'repeat'
  | 'isComposing'
  | 'defaultPrevented'
  | 'composedPath'
  | 'preventDefault'
>;

type TowardStartOrEnd = -1 | 1;

interface ScrollStep {
  direction: TowardStartOrEnd;
  byOrToEdge?: number;
}

function scrollStep(event: ScrollKey, scroller: HTMLElement): ScrollStep | null {
  const page = scroller.clientHeight * pageKeyShareOfVisibleHeight;
  if (event.key === ' ')
    return event.shiftKey
      ? { direction: -1, byOrToEdge: -page }
      : { direction: 1, byOrToEdge: page };
  if (event.shiftKey) return null;
  switch (event.key) {
    case 'PageDown':
      return { direction: 1, byOrToEdge: page };
    case 'PageUp':
      return { direction: -1, byOrToEdge: -page };
    case 'ArrowDown':
      return { direction: 1, byOrToEdge: arrowKeyStepPx };
    case 'ArrowUp':
      return { direction: -1, byOrToEdge: -arrowKeyStepPx };
    case 'End':
      return { direction: 1 };
    case 'Home':
      return { direction: -1 };
    default:
      return null;
  }
}

function isElement(node: EventTarget | null): node is Element {
  return (node as Node | null)?.nodeType === Node.ELEMENT_NODE;
}

function composedAncestors(element: Element) {
  const chain: Element[] = [];
  let node: Node | null = element;
  while (node) {
    if (isElement(node)) chain.push(node);
    const isShadowRoot: boolean = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
    node = node.parentNode ?? (isShadowRoot ? (node as ShadowRoot).host : null);
  }
  return chain;
}

function mayHoldFocusOutOfSight(element: Element, view: Window) {
  const mayHaveClosedShadowRoot = element.shadowRoot !== null || element.localName.includes('-');
  if (mayHaveClosedShadowRoot) return true;
  const takesFocusItself =
    (element as HTMLElement).tabIndex >= 0 || element.matches(focusableSelector);
  if (takesFocusItself) return false;
  const { overflowX, overflowY } = view.getComputedStyle(element);
  const scrollAreaThatTakesFocusWithoutTabindex =
    /^(auto|scroll)$/.test(overflowX) || /^(auto|scroll)$/.test(overflowY);
  return !scrollAreaThatTakesFocusWithoutTabindex;
}

function scrollRoom(element: Element, direction: TowardStartOrEnd) {
  return direction > 0
    ? element.scrollHeight - element.clientHeight - element.scrollTop
    : element.scrollTop;
}

/**
 * Scrolls the region with the keyboard: the window's keys and the targets of the pointer's presses,
 * which useScrollKeys hears, reach it through `keyDown` and `press`, and it notes other input
 * itself until `stop`.
 */
export function createScrollKeys(root: HTMLElement, scroller: HTMLElement, view: Window) {
  const document = root.ownerDocument;
  const reducedMotion = reducedMotionQuery(view);
  let smoothScrollHeadingTo: number | null = null;
  let lastPressedWhereBrowserScrollsFromDocument: Element | null = null;

  function scrollsThatWay(element: Element, direction: TowardStartOrEnd) {
    return (
      /^(auto|scroll)$/.test(view.getComputedStyle(element).overflowY) &&
      scrollRoom(element, direction) > 1
    );
  }

  function regionTakesKey(event: ScrollKey, direction: TowardStartOrEnd) {
    const page = document.scrollingElement;
    const documentStillScrolls = page !== null && scrollRoom(page, direction) > 1;
    if (documentStillScrolls) return false;
    const chain = event.composedPath().filter(isElement);
    const focused = chain[0];
    if (!focused) return false;
    const onDocument = focused === document.body || focused === document.documentElement;
    const pressed = lastPressedWhereBrowserScrollsFromDocument;
    const origin = onDocument ? (pressed?.isConnected ? composedAncestors(pressed) : []) : chain;
    const browserScrollsRegionItself = origin.includes(scroller);
    if (browserScrollsRegionItself) return false;
    if (!onDocument) {
      const end = chain.indexOf(root);
      const focusOutsideRoot = end === -1;
      if (focusOutsideRoot) return false;
      const keyMayBeTyped = mayHoldFocusOutOfSight(focused, view);
      if (keyMayBeTyped) return false;
      for (const element of chain.slice(0, end)) {
        if (
          element.matches(handlesScrollKeysSelector) ||
          (element as HTMLElement).isContentEditable
        )
          return false;
        if (event.key === ' ' && element.matches(activatedBySpaceSelector)) return false;
      }
    }
    return !origin.some((element) => scrollsThatWay(element, direction));
  }

  function onKeyDown(event: ScrollKey) {
    const step =
      event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
        ? null
        : scrollStep(event, scroller);
    if (!step || !regionTakesKey(event, step.direction)) {
      if (!modifierOnlyKeys.has(event.key)) smoothScrollHeadingTo = null;
      return;
    }
    event.preventDefault();
    const end = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const quickPressesAddUpFrom = Math.min(
      Math.max(smoothScrollHeadingTo ?? scroller.scrollTop, 0),
      end,
    );
    const top =
      step.byOrToEdge === undefined
        ? step.direction > 0
          ? end
          : 0
        : Math.min(Math.max(quickPressesAddUpFrom + step.byOrToEdge, 0), end);
    const heldKeyRepeatsFasterThanSmoothScroll = event.repeat;
    const smooth = !heldKeyRepeatsFasterThanSmoothScroll && !reducedMotion?.matches;
    smoothScrollHeadingTo = smooth && Math.abs(top - scroller.scrollTop) >= 1 ? top : null;
    scroller.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
  }
  function press(firstTargetOfComposedPath: EventTarget | null) {
    lastPressedWhereBrowserScrollsFromDocument = isElement(firstTargetOfComposedPath)
      ? firstTargetOfComposedPath
      : null;
    smoothScrollHeadingTo = null;
  }
  function forgetSmoothScroll() {
    smoothScrollHeadingTo = null;
  }

  const beforePageHandlesItWithoutDelay = { capture: true, passive: true };
  view.addEventListener('wheel', forgetSmoothScroll, beforePageHandlesItWithoutDelay);
  view.addEventListener('touchstart', forgetSmoothScroll, beforePageHandlesItWithoutDelay);
  scroller.addEventListener('scrollend', forgetSmoothScroll);
  return {
    keyDown: onKeyDown,
    press,
    stop() {
      view.removeEventListener('wheel', forgetSmoothScroll, beforePageHandlesItWithoutDelay);
      view.removeEventListener('touchstart', forgetSmoothScroll, beforePageHandlesItWithoutDelay);
      scroller.removeEventListener('scrollend', forgetSmoothScroll);
    },
  };
}
