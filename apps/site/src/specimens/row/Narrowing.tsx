import type { ReactNode } from 'react';
import { useSharedTimeline } from '../../previews/Motion';
import { WidthSweep } from '../../previews/WidthSweep';

/** The pane's widths, in rem: wide enough for both actions on one line, and narrow. */
const widths = [26, 15];

/**
 * A do's or a don't's pane, narrowing from wide to narrow and back, in step with its pair: both
 * take their step from one clock.
 */
export function Narrowing({ children }: { children: ReactNode }) {
  const step = useSharedTimeline('row-actions', [4000, 4500]);
  return (
    <WidthSweep widths={widths} at={step}>
      {children}
    </WidthSweep>
  );
}
