'use client';

import { useState } from 'react';

/**
 * Whether a popup is open: as `open` says while it is given, else as the component keeps it,
 * starting at `defaultOpen`. Returns it and a function that asks for a new state with its details:
 * it keeps the state where the component keeps its own, and reports it to `onOpenChange` either way.
 */
export function useOpenState<Details>({
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  open: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange: ((open: boolean, details: Details) => void) | undefined;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  function setOpen(next: boolean, details: Details) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, details);
  }
  return [open ?? uncontrolledOpen, setOpen] as const;
}
