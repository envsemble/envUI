import { ColorPicker } from '@envsemble/envui/color';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const format = '.env-color-picker-format .env-button';
const choice = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer opens the format menu and picks RGB: the hex field gives way to R, G and B. It
 * opens it again for HSL, and once more for Hex, where it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: format, x: 0.4 },
  { wait: 300 },
  { click: true },
  { wait: 450 },
  { to: choice(2), x: 0.3, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1300 },
  { to: format, x: 0.4, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: choice(3), x: 0.3, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1300 },
  { to: format, x: 0.4, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: choice(1), x: 0.3, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 900 },
];

function Switching() {
  usePointer(script);
  return (
    // Room below the picker for the menu, which opens under its button, so the stage keeps one
    // height as it opens and closes.
    <div style={{ inlineSize: 'min(100%, 14rem)', paddingBlockEnd: '8.5rem' }}>
      <ColorPicker label="Highlight color" defaultValue="#6b4fa3" />
    </div>
  );
}

/** The format menu switching the picker's fields from hex to RGB, HSL and back. */
export default function FormatMenu() {
  return (
    <SpecimenFrame size="field">
      <MotionStage label="the format menu switching the fields">
        <Switching />
      </MotionStage>
    </SpecimenFrame>
  );
}
