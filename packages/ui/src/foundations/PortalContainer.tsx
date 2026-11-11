'use client';

// @client-module It provides the portal container context, which React reads only in client modules.

import { useMemo, type ReactNode } from 'react';
import { PortalContainerContext } from '../internal/popup/PortalContainerContext.js';

export interface PortalContainerProps {
  /**
   * The element that envUI's popups, dialogs, sheets and toasts inside render into, in place of
   * the document's body, such as an element in a shadow root or in an iframe's document. Pass null
   * while the element mounts: overlays wait for it.
   */
  container: HTMLElement | null;
  /**
   * Whether the overlays belong to the container rather than the window, as in a preview of an
   * interface: a modal one neither locks the page's scroll, traps focus nor hides the rest of the
   * page; a dialog takes no focus as it opens; a popup opens on its own side without flipping and
   * sizes to its content; toasts are shown without the page's F6 shortcut; and a press or Esc
   * outside the container and the overlay's trigger doesn't close them, while the trigger and the
   * overlay's own controls do. Make the container a containing block, such as with
   * `contain: layout`, to keep fixed overlays, such as dialogs and their backdrops, inside it, and
   * give it or an ancestor `container-type: inline-size`: a popup is at most as wide as that size
   * container, or else as the window. A ContextMenu opens there too, at the pointer or below the
   * focused element, without hiding the page or locking its scroll; a long press doesn't open it.
   * Panes' supporting pane, as a sheet there, isn't modal either: the page stays in use.
   * @default false
   */
  contained?: boolean;
  /** The content whose popups, dialogs and toasts render in the container. */
  children: ReactNode;
}

/**
 * Renders envUI's overlays inside it, popups, dialogs, sheets and toasts, into another element than
 * the document's body, and with `contained`, as part of that element.
 */
export function PortalContainer({ container, contained = false, children }: PortalContainerProps) {
  const value = useMemo(() => ({ container, contained }), [container, contained]);
  return <PortalContainerContext value={value}>{children}</PortalContainerContext>;
}
