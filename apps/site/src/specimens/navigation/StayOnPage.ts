import { useEffect } from 'react';

/**
 * Keeps the links an animated figure's pointer presses, such as a rail's destinations, from
 * following their address: the example changes its page in its own state, and the site stays
 * where the reader is. For a figure whose example must sit straight on the stage, such as a
 * Scaffold standing in for a window, where a wrapper of its own would catch the clicks.
 */
export function useStayOnPage() {
  useEffect(() => {
    const stay = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.catalogue-motion-subject a[href]')
      )
        event.preventDefault();
    };
    window.addEventListener('click', stay, true);
    return () => window.removeEventListener('click', stay, true);
  }, []);
}
