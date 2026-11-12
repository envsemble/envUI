import { ColorPickerButton } from '@envsemble/envui/color';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

const button = '.env-color-picker-button';
const hue = ".env-color-picker-slider[data-channel='hue']";

/** Where a hue is along the strip, red at both ends. */
const at = (degrees: number) => ({ x: 0.5, y: 1 - degrees / 360 });

/*
 * The pointer presses the button, and the picker opens under it. It drags the hue up to violet
 * and down to amber, the button's swatch and value following, then back to the teal it began
 * with, and closes the picker with Escape.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: button, x: 0.4 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { to: `${hue} .env-color-picker-thumb`, duration: 500 },
  { wait: 120 },
  { press: true },
  { to: hue, ...at(262), duration: 800 },
  { wait: 180 },
  { to: hue, ...at(32), duration: 1100 },
  { wait: 180 },
  { to: hue, ...at(168), duration: 800 },
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
    // Room below the button for the picker, which opens under it, so the stage keeps one height;
    // more on a narrow stage, where the picker stands taller.
    <div style={{ paddingBlockEnd: roomFor(21.75, 23, 30) }}>
      <ColorPickerButton label="Label color" defaultValue="#2f6f62" />
    </div>
  );
}

/** The label color's button, opened, its hue dragged and closed by a pointer no one sees. */
export default function PickerButtonOpenMotion() {
  return (
    <MotionStage label="the picker opening from its button">
      <Picking />
    </MotionStage>
  );
}
