import type { Popover } from '@base-ui/react/popover';
import type { RefObject } from 'react';

/** Where focus goes as a popup closes, as each Base UI popup that moves focus takes it. */
export type FocusTarget = NonNullable<Popover.Popup.Props['initialFocus']>;

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

function resolveFinalFocus(
  target: FocusTarget | undefined,
  closeType: CloseType,
): Element | null | false {
  const value = typeof target === 'function' ? target(closeType) : target;
  if (value === false) return false;
  if (value === true || value == null) return null;
  return 'current' in value ? value.current : value;
}

const beforePopupHandlers = true;

const tabbable =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function firstTabbable(element: HTMLElement): HTMLElement {
  if (element.tabIndex >= 0) return element;
  return element.querySelector<HTMLElement>(tabbable) ?? element;
}

const canFocus = (element: HTMLElement) =>
  !element.matches(':disabled') &&
  element.closest('[inert]') === null &&
  element.checkVisibility({ visibilityProperty: true });

const hasStartedClosing = (popup: Element) => popup.hasAttribute('data-closed');

/**
 * Moves focus out of a popup as it starts to close, to where Base UI returns it once the popup has
 * gone: the owner's finalFocus, else its trigger where focus can go there, else the element focus
 * came into the popup from. It leaves the close to Base UI where focus has already left the popup,
 * where a pointer press outside the popup and its trigger closed it, and where the target is in a
 * closing popup. Returns what stops it.
 */
export function returnFocusAsItCloses(popup: HTMLElement, state: { current: ClosingFocus }) {
  const document = popup.ownerDocument;
  const send = () => {
    const { finalFocus, trigger, enteredFrom, closeType, pressedOutside } = state.current;
    const active = document.activeElement;
    if (pressedOutside || !(active instanceof HTMLElement) || !popup.contains(active)) return;
    const named = resolveFinalFocus(finalFocus, closeType);
    if (named === false) return;
    const own = trigger?.current;
    const ownTriggerTakesFocus = own instanceof HTMLElement && own.tabIndex >= 0;
    const triggerTarget = ownTriggerTakesFocus ? own : enteredFrom;
    const returnTo = named ?? triggerTarget;
    const target = returnTo instanceof HTMLElement ? firstTabbable(returnTo) : null;
    if (
      !target?.isConnected ||
      !canFocus(target) ||
      popup.contains(target) ||
      target.closest('[data-closed]') !== null
    )
      return;
    target.focus({ preventScroll: true, focusVisible: closeType === 'keyboard' });
  };
  const noteWhetherJustStartedClosing = () => {
    const closed = hasStartedClosing(popup);
    const closing = closed && !state.current.closed;
    const reopened = !closed && state.current.closed;
    if (reopened) {
      state.current.enteredFrom = null;
      state.current.pressedOutside = false;
    }
    state.current.closed = closed;
    return closing;
  };
  const observer = new MutationObserver(() => {
    if (noteWhetherJustStartedClosing()) send();
  });
  observer.observe(popup, { attributes: true, attributeFilter: ['data-closed'] });
  const enter = (event: FocusEvent) => {
    const from = event.relatedTarget;
    if (state.current.enteredFrom || !(from instanceof Element) || popup.contains(from)) return;
    state.current.enteredFrom = from;
  };
  const press = (event: PointerEvent) => {
    state.current.closeType = (event.pointerType || 'mouse') as CloseType;
    const pressed = event.target instanceof Node ? event.target : null;
    const trigger = state.current.trigger?.current;
    const pressedPopupOrOwnTrigger =
      pressed !== null && (popup.contains(pressed) || (trigger?.contains(pressed) ?? false));
    state.current.pressedOutside = !pressedPopupOrOwnTrigger;
  };
  const key = () => {
    state.current.closeType = 'keyboard';
    state.current.pressedOutside = false;
  };
  popup.addEventListener('focusin', enter);
  document.addEventListener('pointerdown', press, beforePopupHandlers);
  document.addEventListener('keydown', key, beforePopupHandlers);
  const closedInCommitThatAttached = noteWhetherJustStartedClosing();
  if (closedInCommitThatAttached) send();
  return () => {
    observer.disconnect();
    popup.removeEventListener('focusin', enter);
    document.removeEventListener('pointerdown', press, beforePopupHandlers);
    document.removeEventListener('keydown', key, beforePopupHandlers);
  };
}
