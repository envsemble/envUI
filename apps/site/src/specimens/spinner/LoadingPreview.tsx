import LoadingPreview from '../../examples/spinner/LoadingPreview';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

/*
 * The preview's frame spins while the file renders, two seconds, and its first page takes the
 * spinner's place; the file is opened again, and the frame spins again.
 */
function Opening() {
  const step = useTimeline([3600, 3600]);
  // Each step opens the file anew, which renders it again: 2 s spinning, then its page a while.
  return <LoadingPreview key={step} />;
}

/** The overview's preview, loading and then shown, opened again and again. */
// eslint-disable-next-line no-restricted-syntax -- named after its example, a file's preview loading
export default function LoadingPreviewMotion() {
  return (
    <MotionStage label="the preview loading and taking the spinner's place">
      <Opening />
    </MotionStage>
  );
}
