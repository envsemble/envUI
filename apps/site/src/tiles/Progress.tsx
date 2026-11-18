import { Progress } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

const values = [40, 55, 72, 86, 100, 0, 18];
const durations = [420, 270, 330, 270, 660, 270, 270];

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
