'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  type CSSProperties,
  type RefObject,
} from 'react';

/** What PortalContainer gives the overlays inside it. */
export interface PortalContainerValue {
  /**
   * The element overlays render into: undefined for the document's body, null while the element
   * mounts, when overlays wait for it.
   */
  container?: HTMLElement | null;
  /** Whether the overlays belong to the container rather than the window. */
  contained: boolean;
}

/** The nearest PortalContainer's value; outside one, the document's body and no containment. */
export const PortalContainerContext = createContext<PortalContainerValue>({ contained: false });

/** The nearest PortalContainer's value. */
export function usePortalContainer(): PortalContainerValue {
  return useContext(PortalContainerContext);
}

/** A node, across documents and realms. */
const isNode = (target: unknown): target is Node =>
  !!target && typeof (target as Node).nodeType === 'number';

/** Where an event happened: the innermost node of its path, inside a shadow root too. */
function originOf(event: Event | null | undefined) {
  return event?.composedPath?.()[0] ?? event?.target ?? undefined;
}

/** What Base UI's onOpenChange of an overlay's root receives beside the requested state. */
interface OpenChangeEventDetails {
  event?: Event | null | undefined;
  reason: string;
  trigger?: Element | undefined;
  cancel: () => void;
}

/**
 * Whether a contained overlay keeps itself open against a change: a close that came from outside
 * its container and its own trigger, such as a press elsewhere on the page or Esc while focus is
 * elsewhere, or from no event, such as another tooltip opening, other than code that closes it.
 * Its trigger, which may sit outside the container, still closes it, as do its own controls.
 */
function keepsOpen(
  { container, contained }: PortalContainerValue,
  next: boolean,
  details: OpenChangeEventDetails,
  trigger: Element | null | undefined,
) {
  if (!contained || next || !container) return false;
  // Pressing, hovering away from or leaving the trigger closes it, as it would anywhere, and so
  // does another menu of its menubar or menu opening in its place, or the arrow keys moving to one.
  if (
    details.reason.startsWith('trigger-') ||
    details.reason === 'sibling-open' ||
    details.reason === 'list-navigation'
  )
    return false;
  const origin = originOf(details.event);
  if (!isNode(origin)) return details.reason !== 'imperative-action';
  const own = [container, trigger, details.trigger].filter(
    (element): element is Element => element instanceof Node,
  );
  return !own.some((element) => element.contains(origin));
}

/**
 * The onOpenChange of an overlay's Base UI root: in a contained PortalContainer it cancels a change
 * the overlay keeps itself open against (see keepsOpen), and hands every other change to `handle`.
 * `trigger` is the overlay's own control, such as its button or a combobox's text field, which
 * closes it from outside the container too; null where it has none, or where Base UI names it in
 * the details, as a dialog's root does.
 */
export function containedOpenChange<Details extends OpenChangeEventDetails>(
  portal: PortalContainerValue,
  trigger: RefObject<Element | null> | null,
  handle: (next: boolean, details: Details) => void,
) {
  return (next: boolean, details: Details) => {
    if (keepsOpen(portal, next, details, trigger?.current)) details.cancel();
    else handle(next, details);
  };
}

/**
 * Keeps the page around a contained popup in reach of assistive technology while it is open. Base UI
 * hides the rest of the page from it as some popups open, such as a combobox's list, modal or not;
 * in a contained PortalContainer the page stays in use, so what it hides there shows again: the
 * elements beside the popup's and its control's ancestors, as Base UI picks them. Only what is
 * hidden while the popup is open shows again, never what was hidden before it opened.
 */
export function useKeepPageVisible(
  { contained }: PortalContainerValue,
  open: boolean,
  parts: () => readonly (Element | null | undefined)[],
) {
  useLayoutEffect(() => {
    if (!contained || !open || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((records) => {
      const inside = parts().filter((part): part is Element => part != null);
      for (const { target, oldValue } of records) {
        if (!(target instanceof Element) || target.getAttribute('aria-hidden') !== 'true') continue;
        if (oldValue !== null && oldValue !== 'false') continue;
        const parent = target.parentElement;
        if (!parent || !inside.some((part) => parent.contains(part))) continue;
        if (inside.some((part) => target.contains(part))) continue;
        target.removeAttribute('aria-hidden');
      }
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden'],
      attributeOldValue: true,
    });
    return () => observer.disconnect();
  }, [contained, open, parts]);
}

/**
 * Root props of a Base UI overlay inside a contained PortalContainer: not modal, so it neither
 * locks the page's scroll, traps focus nor hides the rest of the page.
 */
export function containedModal<Modal>(value: PortalContainerValue, modal: Modal): Modal | false {
  return value.contained ? false : modal;
}

/**
 * The style a contained popup adds to its popup element: it sizes to its content within the
 * container's width, rather than to the room the window leaves beside its anchor.
 */
export const containedPopupStyle = {
  '--available-height': '100vh',
  '--available-width': '100cqi',
} as CSSProperties;

/**
 * The positioner props of a contained popup: it opens on its own side, without flipping, and
 * shifts along it only to stay in view.
 */
export const containedCollisionAvoidance = {
  side: 'none',
  align: 'shift',
  fallbackAxisSide: 'none',
} as const;
