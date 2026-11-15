import LoadingPreview from '../../examples/spinner/LoadingPreview';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const eachOpeningMs = 3600;

function Opening() {
  const opening = useTimeline([eachOpeningMs, eachOpeningMs]);
  return <LoadingPreview key={opening} />;
}

// eslint-disable-next-line no-restricted-syntax
export default function LoadingPreviewMotion() {
  return (
    <MotionStage label="the preview loading and taking the spinner's place">
      <Opening />
    </MotionStage>
  );
}
