'use client';

import type { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useCallback, type RefObject } from 'react';
import { usePortalContainer } from '../../internal/provider/PortalContainerContext.js';
import { containedOpenChange, useKeepPageVisible } from '../../internal/popup/containedOverlays.js';
import { useControllableState } from '../../internal/react/useControllableState.js';
import type { ComboboxOpenChangeDetails, ComboboxProps } from '../Combobox.js';

export function useComboboxOpen({
  open,
  defaultOpen = false,
  onOpenChange,
  popupRef,
  inputRef,
}: Pick<ComboboxProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
  popupRef: RefObject<HTMLElement | null>;
  inputRef: RefObject<HTMLElement | null>;
}) {
  const [popupOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const portal = usePortalContainer();
  useKeepPageVisible(
    portal,
    popupOpen,
    useCallback(() => [popupRef.current, inputRef.current], [popupRef, inputRef]),
  );

  function changeOpen(next: boolean, reason: ComboboxOpenChangeDetails['reason']) {
    setOpen(next, { reason });
  }

  const handleOpenChange: (next: boolean, details: BaseCombobox.Root.ChangeEventDetails) => void =
    containedOpenChange(portal, inputRef, (next, details) => changeOpen(next, details.reason));

  return { popupOpen, changeOpen, handleOpenChange };
}
