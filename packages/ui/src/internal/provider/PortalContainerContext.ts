'use client';

import { createContext, useContext } from 'react';

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
