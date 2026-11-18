import { Progress } from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { useRounds } from './Rounds';

const values = [2, 3, 4, 4, 1];
const stepDurationsMs = [660, 660, 1020, 210, 660];
const restartStep = 4;

function Filling() {
  const step = useTimeline(stepDurationsMs);
  const { round, style } = useRounds(step, restartStep);
  const value = values[step];
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

export default function SetupStepsMotion() {
  return (
    <MotionStage label="the steps filling in turn">
      <Filling />
    </MotionStage>
  );
}
