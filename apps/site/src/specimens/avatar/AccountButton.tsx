import AccountButton from '../../examples/avatar/AccountButton';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-avatar-button', x: 0.55, y: 0.6 },
  { wait: 1560 },
  { leave: true },
  { wait: 660 },
];

function Hovering() {
  usePointer(script);
  return <AccountButton />;
}

export default function AccountButtonMotion() {
  return (
    <MotionStage label="the name showing in a tooltip" height="11rem">
      <Hovering />
    </MotionStage>
  );
}
