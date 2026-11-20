'use client';

import type { OverlayOpenChangeReason } from '../../internal/popup/overlayOpenChangeReason.js';
import { useControllableState } from '../../internal/react/useControllableState.js';
import type { PopoverOpenChangeReason } from '../../overlays/Popover.js';

/**
 * Why a date, time or month picker's popup asks to open or close: a popover's reasons, such as
 * trigger-press, outside-press or escape-key; list-navigation for the arrow keys on the field;
 * item-press for a chosen value, such as a day, a month, Today or Now; or clear-press for the
 * clear button.
 */
export type PickerOpenChangeReason = Extract<
  OverlayOpenChangeReason,
  PopoverOpenChangeReason | 'list-navigation' | 'item-press' | 'clear-press'
>;

/** What a date, time or month picker's onOpenChange receives beside the requested state. */
export interface PickerOpenChangeDetails {
  /** Why the popup asks to open or close. */
  reason: PickerOpenChangeReason;
}

export function usePicker({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  value: string | null | undefined;
  defaultValue: string | null;
  onValueChange: ((value: string | null) => void) | undefined;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange: ((open: boolean, details: PickerOpenChangeDetails) => void) | undefined;
}) {
  const [raw, report, keepOwn] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [shown, setShown] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return {
    raw,
    change(next: string | null, serialized: string) {
      if ((next ?? '') !== serialized) report(next);
    },
    reset() {
      keepOwn(defaultValue);
    },
    open: shown,
    setOpen(next: boolean, reason: PickerOpenChangeReason) {
      setShown(next, { reason });
    },
  };
}

export type Picker = ReturnType<typeof usePicker>;
