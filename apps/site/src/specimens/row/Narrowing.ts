import { useSharedTimeline } from '../../previews/Motion';

/** The pane's widths, in rem: wide enough for both actions on one line, and narrow. */
export const widths = [26, 15];

/**
 * Where a do's or a don't's pane is, wide or narrow, in step with its pair: both take their step
 * from one clock. Give it to WidthSweep's `at`.
 */
export const useNarrowing = () => useSharedTimeline('row-actions', [4000, 4500]);
