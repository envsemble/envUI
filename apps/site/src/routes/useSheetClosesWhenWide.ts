import { useEffect } from 'react';
import { windowClasses } from '@envsemble/envui';

/** The navigation's sheet is for narrower windows: one wide enough for the drawer closes it. */
export function useSheetClosesWhenWide(open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia(`(width >= ${windowClasses.expanded})`);
    const close = () => wide.matches && setOpen(false);
    close();
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [open, setOpen]);
}
