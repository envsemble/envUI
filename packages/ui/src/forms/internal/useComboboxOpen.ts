'use client';

import type { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useCallback, type RefObject } from 'react';
import {
  containedOpenChange,
  useKeepPageVisible,
  usePortalContainer,
} from '../../internal/popup/PortalContainerContext.js';
import { useOpenState } from '../../internal/popup/useOpenState.js';
import type { ComboboxOpenChangeDetails, ComboboxProps } from '../Combobox.js';

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
  const [popupOpen, setOpen] = useOpenState({ open, defaultOpen, onOpenChange });
  const portal = usePortalContainer();
  // Base UI hides the rest of the page while the list is open; a contained one leaves it in reach.
  useKeepPageVisible(
    portal,
    popupOpen,
    useCallback(() => [popupRef.current, inputRef.current], [popupRef, inputRef]),
  );

  function changeOpen(next: boolean, reason: ComboboxOpenChangeDetails['reason']) {
    setOpen(next, { reason });
  }

  // The text field is the list's trigger: Esc in it, or focus leaving it, closes the list there too.
  const handleOpenChange: (next: boolean, details: BaseCombobox.Root.ChangeEventDetails) => void =
    containedOpenChange(portal, inputRef, (next, details) => changeOpen(next, details.reason));

  return { popupOpen, changeOpen, handleOpenChange };
}
