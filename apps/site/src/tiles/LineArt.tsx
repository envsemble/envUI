import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

/** The drawing at rest, then playing, a little longer than its motion takes, which ends still. */
const durations = [600, 6500];

/**
 * The golden section on its own, straight on the tile's stage, with nothing framing it, as the
 * drawing it is. The box it fills is small, in a tile's window as small (Tiles.ts), so it is drawn
 * large and its hairlines thick enough to read in dark too, where they are fainter. Playing, its
 * lines run out past their ends and draw themselves in again, one after another from the rectangle
 * that frames it, so the drawing is never empty, and rest: LineArt's own play motion.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    // In the flow and a little inside its window rather than over all of it, so the tile's fit
    // measures the drawing itself, as it measures what any tile shows, rather than taking it for a
    // backdrop (useFit.ts).
    <LineArt
      drawing="golden-section"
      style={{ display: 'block', inlineSize: '5.5rem', aspectRatio: '16 / 10' }}
      motion={step === 1 ? 'play' : undefined}
    />
  );
}
