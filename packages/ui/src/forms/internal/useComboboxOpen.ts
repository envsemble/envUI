'use client';

import type { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useCallback, useState, type RefObject } from 'react';
import {
  keepsOpen,
  useKeepPageVisible,
  usePortalContainer,
} from '../../internal/PortalContainerContext.js';
import type { ComboboxProps } from '../Combobox.js';

/**
 * Whether a combobox's list is open: as it is given, or as the field keeps it itself. Returns it,
 * a function that opens or closes it and reports why, and the handler for Base UI's requests, which
 * a contained PortalContainer keeps from closing the list on presses outside it.
 */
export function useComboboxOpen({
  open,
  defaultOpen,
  onOpenChange,
  popupRef,
  inputRef,
}: Pick<ComboboxProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  popupRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLElement | null>;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const popupOpen = open ?? uncontrolledOpen;
  const portal = usePortalContainer();
  // Base UI hides the rest of the page while the list is open; a contained one leaves it in reach.
  useKeepPageVisible(
    portal,
    popupOpen,
    useCallback(() => [popupRef.current, inputRef.current], [popupRef, inputRef]),
  );

  function changeOpen(next: boolean, reason: string) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, { reason });
  }

  function handleOpenChange(next: boolean, details: BaseCombobox.Root.ChangeEventDetails) {
    if (keepsOpen(portal, next, details)) details.cancel();
    else changeOpen(next, details.reason);
  }

  return { popupOpen, changeOpen, handleOpenChange };
}
