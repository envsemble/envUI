import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import type { TileWindow } from './Tiles';

/**
 * The drawing at rest, then playing for a little longer than its motion takes, which ends still.
 */
const durations = [360, 3900];

/** A smaller window than the tiles' (TileStage.css), drawn larger: a drawing has no size of its own. */
export const tileWindow: TileWindow = { width: 6, height: 3.75 };

/**
 * The golden section on its own, straight on the tile's stage, with nothing framing it, as the
 * drawing it is. The box it fills is small, in an equally small tile window (tileWindow), so it is
 * drawn large, with hairlines thick enough to read in the dark theme too, where they are fainter.
 * While it plays, its lines run out past their ends and draw themselves in again, one after another
 * from the rectangle that frames it, so the drawing is never empty, and then rest: LineArt's own
 * play motion.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    // In the flow and a little inside its window, rather than covering all of it, so the tile's fit
    // measures the drawing itself, as it measures what any tile shows, rather than treating it as a
    // backdrop (useFit.ts).
    <LineArt
      drawing="golden-section"
      style={{ display: 'block', inlineSize: '5.5rem', aspectRatio: '16 / 10' }}
      motion={step === 1 ? 'play' : undefined}
    />
  );
}
