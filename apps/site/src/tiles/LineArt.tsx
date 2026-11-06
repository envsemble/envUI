import { LineArt, Surface } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';

/** The drawing at rest, then playing, a little longer than its motion takes, which ends still. */
const durations = [600, 6500];

/**
 * The golden section on a recessed well, as LineArt sits behind an empty state: covering the
 * well, resting on its foot and cropped from its start, its hairlines in their own muted color on
 * the well's fill, as an application shows them; the recessed fill, the deepest in dark, is the
 * one they stand out from most there, where they are fainter. The surface is small, in a tile's window as
 * small (Tiles.ts), so it is drawn large and its hairlines thick enough to read in dark too, where
 * they are fainter. Playing, its lines run out past their ends
 * and draw themselves in again, one after another from the rectangle that frames it, so the
 * drawing is never empty, and rest: LineArt's own play motion.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    <Surface
      background="recessed"
      style={{
        position: 'relative',
        overflow: 'hidden',
        inlineSize: '6rem',
        aspectRatio: '16 / 10',
        ...outlined,
      }}
    >
      <LineArt
        drawing="golden-section"
        style={{ position: 'absolute', inset: 0 }}
        motion={step === 1 ? 'play' : undefined}
      />
    </Surface>
  );
}
