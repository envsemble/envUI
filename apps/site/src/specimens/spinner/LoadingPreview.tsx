import LoadingPreview from '../../examples/spinner/LoadingPreview';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The preview's frame spins while the file renders, two seconds, and its first page takes the
 * spinner's place; the file is opened again, and the frame spins again.
 */
function Opening() {
  const step = useTimeline([6000, 6000]);
  // Each step opens the file anew, which renders it again: 2 s spinning, then its page a while,
  // the timeline's steps being cut to 0.6 of what they are written as.
  return <LoadingPreview key={step} />;
}

/** The overview's preview, loading and then shown, opened again and again. */
export default function LoadingPreviewMotion() {
  return (
    <MotionStage label="the preview loading and taking the spinner's place">
      <Opening />
    </MotionStage>
  );
}
