import { useSharedTimeline } from '../../motion/Timeline';

/**
 * The pane's widths, in rem: narrow, where the rule matters, and wide enough for two fitting
 * columns, which the frame is drawn smaller to show beside its pair.
 */
export const paneWidths = [16, 26];

/*
 * Each step holds the pane at one width; the frame takes about 1.4 s to move from one to the
 * other, which the step includes.
 */
const steps = [2520, 2520];

/**
 * The width the pane is at, by its index in paneWidths: the do and the don't take it from one
 * shared clock, so their panes narrow and widen together.
 */
export const usePaneWidth = () => useSharedTimeline('grid-pane', steps);
