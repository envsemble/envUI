import { useLayoutEffect, useState, type RefObject } from 'react';

export function useStackingAsTheContainerQueryLaidItOut(
  region: RefObject<HTMLElement | null>,
  table: RefObject<HTMLElement | null>,
  enabled: boolean,
  stackBelow: string | number,
) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const element = region.current;
    const grid = table.current;
    if (!enabled || !element || !grid) {
      setStacked(false);
      return;
    }
    const read = () => {
      const hiddenRegionLaysNothingOut = element.getClientRects().length === 0;
      if (hiddenRegionLaysNothingOut) return;
      setStacked(getComputedStyle(grid).getPropertyValue('--_table-stacked').trim() === '1');
    };
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [region, table, enabled, stackBelow]);
  return enabled && stacked;
}
