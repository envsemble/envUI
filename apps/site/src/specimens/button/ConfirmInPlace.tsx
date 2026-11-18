import ConfirmInPlace from '../../examples/button/ConfirmInPlace';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const remove = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-confirm-button`;

const pastTheDisarmDelayMs = 4320;

const script: PointerStep[] = [
  { wait: 300 },
  { to: remove(2), x: 0.5, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: pastTheDisarmDelayMs },
];

function Removing() {
  usePointer(script);
  return <ConfirmInPlace />;
}

export default function ConfirmInPlaceMotion() {
  return (
    <MotionStage label="the remove button arming and disarming">
      <Removing />
    </MotionStage>
  );
}
