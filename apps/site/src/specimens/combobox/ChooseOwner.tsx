import ChooseOwner from '../../examples/combobox/ChooseOwner';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const input = '.env-combobox-input';
const clear = '.env-combobox-clear';
const trigger = '.env-combobox-trigger';
const option = (index: number) => `.env-combobox-item:nth-child(${index} of .env-combobox-item)`;

/*
 * The pointer clears Alex Morgan and types "sha": the list narrows to Priya Shah as the letters
 * come, and it picks her. Then it opens the whole list from the trigger and picks Alex Morgan
 * again, where it began.
 */
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
  // The field at the top of a box as tall as it and its whole open list, so the list fits in the
  // stage from the start.
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', minBlockSize: '20rem' }}
    >
      <ChooseOwner />
    </div>
  );
}

/** The owner field, filtered as a pointer no one sees types a name, and the match chosen. */
export default function ChooseOwnerMotion() {
  return (
    <MotionStage label="the list narrowing as a name is typed">
      <Choosing />
    </MotionStage>
  );
}
