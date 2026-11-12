import { Slider } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const thumb = '.env-slider-thumb input';

/*
 * The keyboard's focus arrives on the slider, which shows its focus ring and its handle; the arrow
 * keys step the value up and back down, with no ticks; and focus moves on.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { focus: thumb },
  { wait: 540 },
  ...Array.from({ length: 3 }, (): PointerStep[] => [{ key: 'ArrowRight' }, { wait: 300 }]).flat(),
  { wait: 300 },
  ...Array.from({ length: 3 }, (): PointerStep[] => [{ key: 'ArrowLeft' }, { wait: 300 }]).flat(),
  { wait: 360 },
  { blur: true },
  { wait: 540 },
];

function Stepped() {
  usePointer(script);
  return (
    <Slider
      label="Brightness"
      defaultValue={40}
      step={10}
      formatValue={(value) => `${value}%`}
      style={{ inlineSize: '18rem' }}
    />
  );
}

/** Slider with the keyboard: focus shows its ring and handle, and the arrow keys step the value. */
export default function WithTheKeyboard() {
  return (
    <SpecimenFrame size="field">
      <MotionStage label="the slider stepped with the arrow keys">
        <Stepped />
      </MotionStage>
    </SpecimenFrame>
  );
}
