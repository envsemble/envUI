import { Progress } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

/**
 * An upload that advances and finishes, then the next one fills again to where the first began: the
 * value at each step, which the bar follows with its own transition.
 */
const values = [40, 55, 72, 86, 100, 0, 18];
const durations = [420, 270, 330, 270, 660, 270, 270];

/** A progress bar of an upload, with its label and value. */
export default function ProgressTile() {
  const value = values[useTimeline(durations)];
  return (
    <Progress
      label="Uploading"
      value={value}
      valueText={`${value}%`}
      style={{ inlineSize: '9rem' }}
    />
  );
}
