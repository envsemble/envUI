import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/** The drawing at rest, then playing, a little longer than its motion takes, which ends still. */
const durations = [600, 6500];

/**
 * The golden section, whole, across the tile. Playing, its lines run out past their ends and draw
 * themselves in again, one after another from the rectangle that frames it, so the drawing is
 * never empty, and rest: LineArt's own play motion. Its lines take the default edge color, a step
 * stronger than behind a banner, as the layout tiles' drawings do (Reflow.ts).
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    // Across the tile, framed closely on the golden rectangle, so it shows whole and centred.
    <div style={{ inlineSize: '10rem', aspectRatio: '447 / 280' }}>
      <LineArt
        drawing="golden-section"
        viewBox="24 25 447 280"
        motion={step === 1 ? 'play' : undefined}
        style={{ stroke: 'var(--env-color-border-default)' }}
      />
    </div>
  );
}
