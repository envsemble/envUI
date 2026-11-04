import { Progress } from '@envsemble/envui';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { useRounds } from './Rounds';

/* The steps fill one at a time to the fourth; the bar fades and starts again from the first. */
const values = [2, 3, 4, 4, 1];
const steps = [1100, 1100, 1700, 350, 1100];

function Filling() {
  const step = useTimeline(steps);
  const { round, style } = useRounds(step, 4);
  const value = values[step]!;
  return (
    <Progress
      key={round}
      label={value === 4 ? 'Workspace ready' : 'Setting up the workspace'}
      value={value}
      max={4}
      segments={4}
      valueText={`Step ${value} of 4`}
      aria-valuetext={`Step ${value} of 4`}
      style={{ ...style, inlineSize: 'min(100%, 22rem)' }}
    />
  );
}

/** The workspace's set-up, its steps filling one at a time. */
export default function SetupStepsMotion() {
  return (
    <MotionStage label="the steps filling in turn">
      <Filling />
    </MotionStage>
  );
}
