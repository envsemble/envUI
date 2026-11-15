import { ColorPicker } from '@envsemble/envui/color';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const format = '.env-color-picker-format .env-button';
const choice = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

const roomForMenuBelow = '8.5rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: format, x: 0.4 },
  { wait: 180 },
  { click: true },
  { wait: 270 },
  { to: choice(2), x: 0.3, duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 780 },
  { to: format, x: 0.4, duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 270 },
  { to: choice(3), x: 0.3, duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 780 },
  { to: format, x: 0.4, duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 270 },
  { to: choice(1), x: 0.3, duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 540 },
];

function Switching() {
  usePointer(script);
  return (
    <div style={{ inlineSize: 'min(100%, 14rem)', paddingBlockEnd: roomForMenuBelow }}>
      <ColorPicker label="Highlight color" defaultValue="#6b4fa3" />
    </div>
  );
}

export default function FormatMenu() {
  return (
    <SpecimenFrame size="field">
      <MotionStage label="the format menu switching the fields">
        <Switching />
      </MotionStage>
    </SpecimenFrame>
  );
}
