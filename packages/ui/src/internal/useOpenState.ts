'use client';

import { useCallback, useState } from 'react';
import { useLatest } from './useLatest.js';

/**
 * Whether a popup is open: as `open` says while it is given, else as the component keeps it,
 * starting at `defaultOpen`. Returns it and a function that asks for a new state with its details:
 * it keeps the state where the component keeps its own, and reports it to `onOpenChange` either way.
 * The function stays the same across renders, for contexts and effects that hold it.
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
  const latest = useLatest({ controlled: open !== undefined, onOpenChange });
  const setOpen = useCallback(
    (next: boolean, details: Details) => {
      if (!latest.current.controlled) setUncontrolledOpen(next);
      latest.current.onOpenChange?.(next, details);
    },
    [latest],
  );
  return [open ?? uncontrolledOpen, setOpen] as const;
}
