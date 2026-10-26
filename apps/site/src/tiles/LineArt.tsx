import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

/** The drawing at rest, then playing, a little longer than its motion takes, which ends still. */
const durations = [600, 6500];

/**
 * The golden section, whole, across the tile. Playing, its lines run out past their ends and draw
 * themselves in again, one after another from the rectangle that frames it, so the drawing is
 * never empty, and rest: LineArt's own play motion.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    // Across the tile, at the drawing's own proportions, so it shows whole.
    <div style={{ inlineSize: '10rem', aspectRatio: '480 / 330' }}>
      <LineArt drawing="golden-section" motion={step === 1 ? 'play' : undefined} />
    </div>
  );
}
