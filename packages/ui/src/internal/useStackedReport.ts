import { useLayoutEffect, useRef } from 'react';

/**
 * Reports whether a layout stacks to its handler before paint, so an application can show the
 * stacked layout's own controls at once. Only a call to a handler moves the reported state on, so a
 * handler added later learns the current state, and a layout that leaves while stacked reports
 * that it no longer stacks.
 */
export function useStackedReport(
  stacked: boolean,
  onStackedChange: ((stacked: boolean) => void) | undefined,
) {
  const reported = useRef(false);
  const handler = useRef(onStackedChange);
  useLayoutEffect(() => {
    handler.current = onStackedChange;
    if (!onStackedChange) {
      reported.current = false;
      return;
    }
    if (stacked === reported.current) return;
    reported.current = stacked;
    onStackedChange(stacked);
  }, [stacked, onStackedChange]);
  useLayoutEffect(
    () => () => {
      if (!reported.current) return;
      reported.current = false;
      handler.current?.(false);
    },
    [],
  );
}
