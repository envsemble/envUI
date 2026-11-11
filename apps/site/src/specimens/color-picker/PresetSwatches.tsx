import PresetSwatches from '../../examples/color-picker/PresetSwatches';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const swatch = (index: number) =>
  `.env-color-picker-swatch:nth-child(${index} of .env-color-picker-swatch)`;

/*
 * The pointer presses Blue, then Red: the thumb, the hue and the hex jump to each. It presses
 * Violet, the color it began with.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: swatch(1) },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { to: swatch(4), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { to: swatch(3), duration: 300 },
  { wait: 200 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  return <PresetSwatches />;
}

/** The project's colors, chosen in turn from the presets by a pointer no one sees. */
export default function PresetSwatchesMotion() {
  return (
    <MotionStage label="the presets chosen in turn">
      <Choosing />
    </MotionStage>
  );
}
