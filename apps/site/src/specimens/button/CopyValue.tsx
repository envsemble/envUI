import CopyValue from '../../examples/button/CopyValue';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/*
 * The pointer presses Copy ID: it shows Copied for about two seconds, then comes back. A click by
 * the pointer no one sees never reaches the reader's clipboard.
 */
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

/** Copy ID, pressed by a pointer no one sees, showing Copied and coming back. */
export default function CopyValueMotion() {
  return (
    <MotionStage label="the copy button showing Copied" height="13rem">
      <Copying />
    </MotionStage>
  );
}
