import { Slider } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const control = '.env-slider-control';

/*
 * The pointer comes over the slider, which shows its handle and ticks; pressed and dragged, it
 * carries the value; let go, the handle and ticks go, though the pointer stays. It leaves, comes
 * back, which shows them again, and drags the value back to where it began.
 */
const script: PointerStep[] = [
  { wait: 600 },
  { to: control, x: 0.3 },
  { wait: 1000 },
  { press: true },
  { to: control, x: 0.7, duration: 1000 },
  { release: true },
  { wait: 1200 },
  { leave: true },
  { wait: 600 },
  { to: control, x: 0.7 },
  { wait: 800 },
  { press: true },
  { to: control, x: 0.3, duration: 1000 },
  { release: true },
  { wait: 900 },
  { leave: true },
  { wait: 700 },
];

function Hovered() {
  usePointer(script);
  return <Slider label="Volume" defaultValue={30} style={{ inlineSize: '18rem' }} />;
}

/** Slider under the pointer: its handle and ticks come with the pointer and go once let go. */
export default function UnderThePointer() {
  return (
    <Example size="field">
      <MotionStage label="the slider under the pointer">
        <Hovered />
      </MotionStage>
    </Example>
  );
}
