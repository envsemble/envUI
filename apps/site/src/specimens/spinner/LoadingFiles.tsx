import LoadingFiles from '../../examples/spinner/LoadingFiles';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const eachOpeningMs = 3600;

function Opening() {
  const opening = useTimeline([eachOpeningMs, eachOpeningMs]);
  return <LoadingFiles key={opening} />;
}

export default function LoadingFilesMotion() {
  return (
    <MotionStage label="the files loading and taking the spinner's place">
      <Opening />
    </MotionStage>
  );
}
