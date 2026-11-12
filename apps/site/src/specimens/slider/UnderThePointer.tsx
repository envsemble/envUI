import { Slider } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const control = '.env-slider-control';

/*
 * The pointer comes over the slider, which shows its handle and ticks; pressed and dragged, it
 * carries the value; let go, the handle and ticks go, though the pointer stays. It leaves, comes
 * back, which shows them again, and drags the value back to where it began.
 */
const script: PointerStep[] = [
  { wait: 360 },
  { to: control, x: 0.3 },
  { wait: 600 },
  { press: true },
  { to: control, x: 0.7, duration: 1000 },
  { release: true },
  { wait: 720 },
  { leave: true },
  { wait: 360 },
  { to: control, x: 0.7 },
  { wait: 480 },
  { press: true },
  { to: control, x: 0.3, duration: 1000 },
  { release: true },
  { wait: 540 },
  { leave: true },
  { wait: 420 },
];

function Hovered() {
  usePointer(script);
  return <Slider label="Volume" defaultValue={30} style={{ inlineSize: '18rem' }} />;
}

/** Slider under the pointer: its handle and ticks come with the pointer and go once let go. */
export default function UnderThePointer() {
  return (
    <SpecimenFrame size="field">
      <MotionStage label="the slider under the pointer">
        <Hovered />
      </MotionStage>
    </SpecimenFrame>
  );
}
