import { Slider } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const control = '.env-slider-control';

/*
 * Pressed at its value and dragged on past the maximum, the slider stretches toward the pointer and
 * springs back once let go; then the same past the minimum, and back to where it began. The drag
 * is the slider's own, by a pointer no one sees (usePointer).
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: control, x: 0.6 },
  { wait: 400 },
  { press: true },
  { to: control, x: 1, duration: 600 },
  { to: control, x: 1.08, duration: 400 },
  { wait: 300 },
  { release: true },
  { wait: 700 },
  { to: control, x: 0.95, duration: 400 },
  { press: true },
  { to: control, x: 0, duration: 900 },
  { to: control, x: -0.08, duration: 400 },
  { wait: 300 },
  { release: true },
  { wait: 700 },
  { to: control, x: 0.05, duration: 400 },
  { press: true },
  { to: control, x: 0.6, duration: 700 },
  { release: true },
  { wait: 400 },
  { leave: true },
  { wait: 600 },
];

function Dragged() {
  usePointer(script);
  return <Slider label="Volume" defaultValue={60} style={{ inlineSize: '18rem' }} />;
}

/** Slider dragged past either end: it stretches a little toward the pointer, then springs back. */
export default function PastTheEnds() {
  return (
    <SpecimenFrame size="field">
      <MotionStage label="the slider stretching past its ends">
        <Dragged />
      </MotionStage>
    </SpecimenFrame>
  );
}
