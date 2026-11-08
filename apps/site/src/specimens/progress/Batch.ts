import { useSharedTimeline } from '../../motion/Timeline';
import { useRounds } from './Rounds';

/**
 * The batch of three files uploading, in step for the do and the don't: the do's one bar counts
 * the files done, climbing steadily; the don't's bars, one a file, fill unevenly. They finish,
 * fade, and start again from nothing.
 */
const files = [2, 2.5, 3, 3, 0, 0.5, 1, 1.5];
const shares = [
  [100, 100, 30],
  [100, 100, 65],
  [100, 100, 100],
  [100, 100, 100],
  [0, 0, 0],
  [45, 10, 0],
  [90, 30, 5],
  [100, 65, 15],
];
const steps = [900, 900, 1500, 350, 700, 800, 800, 800];

/** The step of the batch's upload: the files done, each file's share, and the bars' round. */
export function useBatch() {
  const step = useSharedTimeline('progress-batch', steps);
  const { round, style } = useRounds(step, 4);
  return { done: files[step], shares: shares[step], round, style };
}
