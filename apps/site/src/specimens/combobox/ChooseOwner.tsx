import ChooseOwner from '../../examples/combobox/ChooseOwner';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const input = '.env-combobox-input';
const clear = '.env-combobox-clear';
const trigger = '.env-combobox-trigger';
const option = (index: number) => `.env-combobox-item:nth-child(${index} of .env-combobox-item)`;

const fieldWithOpenListHeight = '20rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: clear },
  { wait: 180 },
  { click: true },
  { wait: 150 },
  { to: input, x: 0.2, duration: 350 },
  { type: 'sha', into: input, every: 320 },
  { wait: 480 },
  { to: option(1), x: 0.35, duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 720 },
  { to: trigger, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 360 },
  { to: option(1), x: 0.35, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 540 },
];

function Choosing() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: fieldWithOpenListHeight,
      }}
    >
      <ChooseOwner />
    </div>
  );
}

export default function ChooseOwnerMotion() {
  return (
    <MotionStage label="the list narrowing as a name is typed">
      <Choosing />
    </MotionStage>
  );
}
