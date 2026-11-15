import { LineArt } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import type { TileWindow } from './Tiles';

const durations = [360, 3900];

export const tileWindow: TileWindow = { width: 6, height: 3.75 };

export default function LineArtTile() {
  const step = useTimeline(durations);
  return (
    <LineArt
      drawing="golden-section"
      style={{ display: 'block', inlineSize: '5.5rem', aspectRatio: '16 / 10' }}
      motion={step === 1 ? 'play' : undefined}
    />
  );
}
