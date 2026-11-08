import { Progress } from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../motion/MotionStage';
import { useRounds } from './Rounds';

/*
 * The upload climbs from 40% to the end, unevenly as uploads do, and finishes; the bar fades and
 * the next upload starts from nothing, back to 40%.
 */
const shares = [40, 58, 73, 88, 100, 100, 0, 20];
const steps = [900, 800, 800, 800, 1700, 350, 600, 800];

function Uploading() {
  const step = useTimeline(steps);
  const { round, style } = useRounds(step, 6);
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

/** A file's upload running to the end, and the next one starting. */
export default function UploadingFileMotion() {
  return (
    <MotionStage label="the upload running to the end">
      <Uploading />
    </MotionStage>
  );
}
