import type { Popover } from '@base-ui/react/popover';
import type { RefObject } from 'react';

/** Where focus goes as a popup closes, as each Base UI popup that moves focus takes it. */
export type FocusTarget = NonNullable<Popover.Popup.Props['initialFocus']>;

/** How people last acted before the popup closed: Base UI's close types. */
type CloseType = 'keyboard' | 'mouse' | 'touch' | 'pen' | '';

/**
 * What a popup's closing focus reads and keeps while its element is attached again, as it is when
 * its owner passes a new ref: where its owner returns focus, its trigger, and what it has seen.
 */
export interface ClosingFocus {
  /** The owner's finalFocus, if it gives one. */
  finalFocus: FocusTarget | undefined;
  /** The owner's trigger, if it gives one. */
  trigger: RefObject<Element | null> | undefined;
  /** The element focus left as it first entered the popup since the popup opened. */
  enteredFrom: Element | null;
  /** Whether the popup was closed when last seen. */
  closed: boolean;
  /** How people last acted, by a key or a pointer. */
  closeType: CloseType;
  /** Whether that was a pointer press outside the popup. */
  pressedOutside: boolean;
}

export const closingFocusState = (): ClosingFocus => ({
  finalFocus: undefined,
  trigger: undefined,
  enteredFrom: null,
  closed: false,
  closeType: '',
  pressedOutside: false,
});

/** The element a finalFocus names: null where it leaves the choice to Base UI, false for none. */
function resolve(target: FocusTarget | undefined, closeType: CloseType): Element | null | false {
  const value = typeof target === 'function' ? target(closeType) : target;
  if (value === false) return false;
  if (value === true || value == null) return null;
  return 'current' in value ? value.current : value;
}

const tabbable =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * The element itself where Tab reaches it, else the first inside it that Tab reaches, else the
 * element, as Base UI takes it: a menu's row, out of the tab order, takes focus itself.
 */
function firstTabbable(element: HTMLElement): HTMLElement {
  if (element.tabIndex >= 0) return element;
  return element.querySelector<HTMLElement>(tabbable) ?? element;
}

/** Whether a popup element is closed: Base UI marks it so as it starts its exit. */
const isClosed = (popup: Element) => popup.hasAttribute('data-closed');

/**
 * Moves focus out of a popup as it starts to close, to where Base UI returns it once the popup has
 * gone: the owner's finalFocus, else its trigger where focus can go there, else the element focus
 * came into the popup from. Base UI returns focus only once the exit animation has run, so
 * meanwhile the keys people press, such as Enter on the trigger to open the popup again, would reach
 * the closing popup and be lost.
 *
 * It leaves the close to Base UI where focus has already left the popup, where a pointer press
 * outside the popup closed it (the press moves focus itself, and Base UI keeps it from returning
 * where the browser would scroll to the trigger), and where the target is in a closing popup, such
 * as a closing submenu's parent. A finalFocus function runs here with the close type as Base UI
 * gives it, and again once the popup has gone. Returns what stops it.
 */
export function returnFocusAsItCloses(popup: HTMLElement, state: { current: ClosingFocus }) {
  const document = popup.ownerDocument;
  const send = () => {
    const { finalFocus, trigger, enteredFrom, closeType, pressedOutside } = state.current;
    const active = document.activeElement;
    if (pressedOutside || !(active instanceof HTMLElement) || !popup.contains(active)) return;
    const named = resolve(finalFocus, closeType);
    if (named === false) return;
    // A trigger that focus can't reach, such as a context menu's region, gives way.
    const own = trigger?.current;
    const triggerTarget = own instanceof HTMLElement && own.tabIndex >= 0 ? own : enteredFrom;
    const returnTo = named ?? triggerTarget;
    const target = returnTo instanceof HTMLElement ? firstTabbable(returnTo) : null;
    if (!target?.isConnected || popup.contains(target) || target.closest('[data-closed]') !== null)
      return;
    target.focus({ preventScroll: true, focusVisible: closeType === 'keyboard' });
  };
  /** Notes the popup's state; true where it has just started to close. */
  const note = () => {
    const closed = isClosed(popup);
    const closing = closed && !state.current.closed;
    // Opened again, also before its exit ended: focus comes in afresh.
    if (!closed && state.current.closed) {
      state.current.enteredFrom = null;
      state.current.pressedOutside = false;
    }
    state.current.closed = closed;
    return closing;
  };
  const observer = new MutationObserver(() => {
    if (note()) send();
  });
  observer.observe(popup, { attributes: true, attributeFilter: ['data-closed'] });
  const enter = (event: FocusEvent) => {
    const from = event.relatedTarget;
    if (state.current.enteredFrom || !(from instanceof Element) || popup.contains(from)) return;
    state.current.enteredFrom = from;
  };
  const press = (event: PointerEvent) => {
    state.current.closeType = (event.pointerType || 'mouse') as CloseType;
    state.current.pressedOutside = !(event.target instanceof Node && popup.contains(event.target));
  };
  const key = () => {
    state.current.closeType = 'keyboard';
    state.current.pressedOutside = false;
  };
  popup.addEventListener('focusin', enter);
  // Captured on the document, before the popup's own handlers close it.
  document.addEventListener('pointerdown', press, true);
  document.addEventListener('keydown', key, true);
  // The ref attaches once React has committed, where the popup may have closed in the same commit.
  if (note()) send();
  return () => {
    observer.disconnect();
    popup.removeEventListener('focusin', enter);
    document.removeEventListener('pointerdown', press, true);
    document.removeEventListener('keydown', key, true);
  };
}
