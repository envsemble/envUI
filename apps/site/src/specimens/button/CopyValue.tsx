import CopyValue from '../../examples/button/CopyValue';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-copy-button:not([aria-label])', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 2760 },
];

function Copying() {
  usePointer(script);
  return <CopyValue />;
}

export default function CopyValueMotion() {
  return (
    <MotionStage label="the copy button showing Copied" height="13rem">
      <Copying />
    </MotionStage>
  );
}
