import { useSharedTimeline } from '../../motion/Timeline';
import { useRounds } from './Rounds';

const filesDone = [2, 2.5, 3, 3, 0, 0.5, 1, 1.5];
const fileSharesPercent = [
  [100, 100, 30],
  [100, 100, 65],
  [100, 100, 100],
  [100, 100, 100],
  [0, 0, 0],
  [45, 10, 0],
  [90, 30, 5],
  [100, 65, 15],
];
const stepDurationsMs = [540, 540, 900, 210, 420, 480, 480, 480];
const restartStep = 4;

export function useBatch() {
  const step = useSharedTimeline('progress-batch', stepDurationsMs);
  const { round, style } = useRounds(step, restartStep);
  return { done: filesDone[step], shares: fileSharesPercent[step], round, style };
}
