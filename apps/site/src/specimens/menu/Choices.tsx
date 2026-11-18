import { Column } from '@envsemble/envui';
import Choices from '../../examples/menu/Choices';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const radio = (index: number) =>
  `[role="menuitemradio"]:nth-child(${index} of [role="menuitemradio"])`;
const hiddenFiles = '[role="menuitemcheckbox"]';
const trigger = '.env-button';

const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger, x: 0.6, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 270 },
  { to: hiddenFiles, x: 0.4, duration: 450 },
  { wait: 240 },
  { click: true },
  { wait: 540 },
  { to: radio(2), x: 0.4, y: 0.3, duration: 400 },
  { wait: 270 },
  { click: true },
  { wait: 780 },
  { to: trigger, x: 0.6, y: 0.6, duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 270 },
  { to: hiddenFiles, x: 0.4, duration: 450 },
  { wait: 210 },
  { click: true },
  { wait: 480 },
  { to: radio(1), x: 0.4, duration: 400 },
  { wait: 240 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 540 },
];

function Choosing() {
  usePointer(script);
  return (
    <Column style={{ blockSize: '20.5rem', inlineSize: 'min(100%, 33rem)' }}>
      <Choices />
    </Column>
  );
}

export default function ChoicesMotion() {
  return (
    <MotionStage label="the checkbox and radio items">
      <Choosing />
    </MotionStage>
  );
}
