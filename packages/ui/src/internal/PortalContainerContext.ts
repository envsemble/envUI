'use client';

import { createContext, useContext, type CSSProperties } from 'react';

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

/** Whether an event's target is a node outside an element, across documents and realms. */
function outside(container: HTMLElement, target: EventTarget | null | undefined) {
  if (!target || typeof (target as Node).nodeType !== 'number') return false;
  return !container.contains(target as Node);
}

/**
 * Whether a contained overlay keeps itself open against a change: a close that came from outside
 * its container, such as a press elsewhere on the page or Esc while focus is elsewhere, or from no
 * event, such as another tooltip opening, other than code that closes it. An owner cancels such a
 * change in its root's onOpenChange.
 */
export function keepsOpen(
  { container, contained }: PortalContainerValue,
  next: boolean,
  details: { event?: Event | null | undefined; reason?: string },
) {
  if (!contained || next || !container) return false;
  const target = details.event?.target;
  if (!target) return details.reason !== 'imperative-action';
  return outside(container, target);
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
