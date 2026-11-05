import { LineArt, Surface } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';

/** The drawing at rest, then playing, a little longer than its motion takes, which ends still. */
const durations = [600, 6500];

/**
 * The golden section on a surface, as LineArt sits behind a banner or a header: covering the
 * surface, resting on its foot and cropped from its start, its hairlines in their own muted color
 * on the surface's fill, as an application shows them. Playing, its lines run out past their ends
 * and draw themselves in again, one after another from the rectangle that frames it, so the
 * drawing is never empty, and rest: LineArt's own play motion.
 */
export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    <Surface
      background="default"
      style={{
        position: 'relative',
        overflow: 'hidden',
        inlineSize: '9.5rem',
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
