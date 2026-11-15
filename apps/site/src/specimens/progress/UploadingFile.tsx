import { Progress } from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { useRounds } from './Rounds';

const shares = [40, 58, 73, 88, 100, 100, 0, 20];
const stepDurationsMs = [540, 480, 480, 480, 1020, 210, 360, 480];
const restartStep = 6;

function Uploading() {
  const step = useTimeline(stepDurationsMs);
  const { round, style } = useRounds(step, restartStep);
  const share = shares[step];
  return (
    <Progress
      key={round}
      label={share === 100 ? 'Uploaded quarterly-report.pdf' : 'Uploading quarterly-report.pdf'}
      value={share}
      valueText={`${share}%`}
      style={{ ...style, inlineSize: 'min(100%, 22rem)' }}
    />
  );
}

export default function UploadingFileMotion() {
  return (
    <MotionStage label="the upload running to the end">
      <Uploading />
    </MotionStage>
  );
}
