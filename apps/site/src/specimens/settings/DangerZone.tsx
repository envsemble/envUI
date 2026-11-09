import DangerZone from '../../examples/settings/DangerZone';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const remove = '.env-list-item .env-button';
const cancel = '.env-dialog-actions .env-button:first-child';

/*
 * The pointer presses Delete workspace…: the confirmation asks for the workspace's name before it
 * deletes anything. A while to read it, and the pointer cancels.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: remove, x: 0.5, y: 2.4 },
  { to: remove, x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 2600 },
  { to: cancel, x: 0.5, y: 0.6, duration: 650 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 700 },
];

function Confirming() {
  usePointer(script);
  return <DangerZone />;
}

/** The danger zone's confirmation, opened by a pointer no one sees and cancelled. */
export default function DangerZoneMotion() {
  return (
    <MotionStage label="the confirmation asking for the workspace's name" height="22rem">
      <Confirming />
    </MotionStage>
  );
}
