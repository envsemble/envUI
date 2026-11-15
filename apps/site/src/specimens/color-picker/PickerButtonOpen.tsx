import { ColorPickerButton } from '@envsemble/envui/color';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

const button = '.env-color-picker-button';
const hue = ".env-color-picker-slider[data-channel='hue']";

const hueOnStrip = (degrees: number) => ({ x: 0.5, y: 1 - degrees / 360 });

const roomForPickerBelow = roomFor(21.75, 23, 30);

const script: PointerStep[] = [
  { wait: 240 },
  { to: button, x: 0.4 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { to: `${hue} .env-color-picker-thumb`, duration: 500 },
  { wait: 120 },
  { press: true },
  { to: hue, ...hueOnStrip(262), duration: 800 },
  { wait: 180 },
  { to: hue, ...hueOnStrip(32), duration: 1100 },
  { wait: 180 },
  { to: hue, ...hueOnStrip(168), duration: 800 },
  { release: true },
  { wait: 240 },
  { wait: 120 },
  { key: 'Escape', on: '.env-color-picker-popover' },
  { wait: 180 },
  { leave: true },
  { wait: 540 },
];

function Picking() {
  usePointer(script);
  return (
    <div style={{ paddingBlockEnd: roomForPickerBelow }}>
      <ColorPickerButton label="Label color" defaultValue="#2f6f62" />
    </div>
  );
}

export default function PickerButtonOpenMotion() {
  return (
    <MotionStage label="the picker opening from its button">
      <Picking />
    </MotionStage>
  );
}
