import Reviewers from '../../examples/combobox/Reviewers';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

const trigger = '.env-combobox-trigger';
const option = (index: number) => `.env-combobox-item:nth-child(${index} of .env-combobox-item)`;
const remove = (index: number) =>
  `.env-combobox-chip:nth-child(${index} of .env-combobox-chip) .env-combobox-chip-remove`;

const fieldWithOpenListHeight = roomFor(21, 22.5, 30);

const script: PointerStep[] = [
  { wait: 240 },
  { to: trigger },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  { to: option(1), x: 0.35, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 360 },
  { to: option(4), x: 0.35, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 480 },
  { to: trigger, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: remove(4), duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 270 },
  { to: remove(3), duration: 350 },
  { wait: 150 },
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
      <Reviewers />
    </div>
  );
}

export default function ReviewersMotion() {
  return (
    <MotionStage label="chips coming as people are picked">
      <Choosing />
    </MotionStage>
  );
}
