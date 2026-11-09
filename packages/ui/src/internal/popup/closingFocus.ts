import type { Popover } from '@base-ui/react/popover';

/** Where focus goes as a popup closes, as each Base UI popup that moves focus takes it. */
export type FocusTarget = NonNullable<Popover.Popup.Props['initialFocus']>;

/** What a popup's closing focus reads: where its owner returns focus, and where focus came from. */
export interface ClosingFocus {
  /** The owner's finalFocus, if it gives one. */
  finalFocus: FocusTarget | undefined;
  /** The element focus left as it first entered the popup since the popup opened. */
  enteredFrom: Element | null;
}

/** The element a finalFocus names: null where it leaves the choice to Base UI, false for none. */
function resolve(target: FocusTarget | undefined): Element | null | false {
  const value = typeof target === 'function' ? target('') : target;
  if (value === false) return false;
  if (value === true || value == null) return null;
  return 'current' in value ? value.current : value;
}

/** Whether a popup element is closed: Base UI marks it so as it starts its exit. */
const closed = (popup: Element) => popup.hasAttribute('data-closed');

/**
 * Moves focus out of a popup as it starts to close, to where Base UI returns it once the popup has
 * gone: the owner's finalFocus, else the element focus came into the popup from, such as its
 * trigger. Base UI returns focus only once the exit animation has run, so meanwhile the keys people
 * press, such as Enter on the trigger to open the popup again, would reach the closing popup and be
 * lost. Focus that has already left the popup stays where it is, and a target in a closing popup,
 * such as a closing submenu's parent, is left to Base UI. Returns what stops it.
 */
export function returnFocusAsItCloses(popup: HTMLElement, state: { current: ClosingFocus }) {
  const send = () => {
    const document = popup.ownerDocument;
    const active = document.activeElement;
    if (!closed(popup) || !(active instanceof HTMLElement) || !popup.contains(active)) return;
    const named = resolve(state.current.finalFocus);
    if (named === false) return;
    const target = named ?? state.current.enteredFrom;
    if (
      !(target instanceof HTMLElement) ||
      !target.isConnected ||
      popup.contains(target) ||
      target.closest('[data-closed]') !== null
    )
      return;
    target.focus({ preventScroll: true, focusVisible: active.matches(':focus-visible') });
  };
  const observer = new MutationObserver((records) => {
    for (const { oldValue } of records) {
      // Opened again before its exit ended: focus will come in afresh.
      if (!closed(popup)) state.current.enteredFrom = null;
      // A popup that was already closed, such as one kept in the page, is not closing now.
      else if (oldValue === null) send();
    }
  });
  observer.observe(popup, {
    attributes: true,
    attributeFilter: ['data-closed'],
    attributeOldValue: true,
  });
  const enter = (event: FocusEvent) => {
    const from = event.relatedTarget;
    if (state.current.enteredFrom || !(from instanceof Element) || popup.contains(from)) return;
    state.current.enteredFrom = from;
  };
  popup.addEventListener('focusin', enter);
  // The ref attaches once React has committed, where the popup may have closed in the same commit.
  send();
  return () => {
    observer.disconnect();
    popup.removeEventListener('focusin', enter);
  };
}
