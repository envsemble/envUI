import { useEffect, useState } from 'react';

/** How long a dialog takes to go, a little longer than its exit (Dialog.css). */
const leaving = 200;

/**
 * Whether the button under a dialog's tile shows: not while the dialog is open, nor while it fades
 * out, so nothing of the button shows through it as it comes and goes.
 */
export function useTriggerShown(open: boolean) {
  const [gone, setGone] = useState(!open);
  // Opened again, it is no longer gone, in the same render.
  if (open && gone) setGone(false);
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setGone(true), leaving);
    return () => clearTimeout(timer);
  }, [open]);
  return !open && gone;
}
