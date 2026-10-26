import type { CSSProperties } from 'react';
import { Slider } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The slider is dragged to its maximum and on past it, stretching toward the pointer from its
 * other end, and let go, springing back; then the same at its minimum. A drag sets the stretch
 * itself (Slider.tsx); the figure sets the same properties the stylesheet reads, so what it shows
 * is the slider's own stretch and spring.
 */
const steps = [700, 900, 600, 1200, 900, 600, 1200];
const frames: { value: number; origin?: 'left' | 'right'; pulled?: boolean }[] = [
  { value: 60 },
  { value: 100 },
  { value: 100, origin: 'left', pulled: true },
  { value: 100, origin: 'left' },
  { value: 0 },
  { value: 0, origin: 'right', pulled: true },
  { value: 0, origin: 'right' },
];

function Stretching() {
  const { value, origin, pulled } = frames[useTimeline(steps)]!;
  const style = {
    inlineSize: '18rem',
    // Stretched, it stays fixed at the end away from the pointer, and is pulled out over a moment;
    // let go, it springs back from there.
    '--env-slider-stretch': pulled ? 0.06 : 0,
    ...(origin && { '--env-slider-stretch-origin': origin }),
    ...(pulled && { '--env-slider-stretch-spring': '0.45s' }),
  } as CSSProperties;
  return <Slider label="Volume" value={value} style={style} />;
}

/** Slider dragged past either end: it stretches a little toward the pointer, then springs back. */
export default function PastTheEnds() {
  return (
    <Example size="field">
      <MotionStage label="the slider stretching past its ends">
        <Stretching />
      </MotionStage>
    </Example>
  );
}
