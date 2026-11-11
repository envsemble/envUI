import ExportReady from '../../examples/toast/ExportReady';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const dismiss = '.env-toast .env-toast-dismiss';

/*
 * The pointer presses Export members and moves away: a moment later the export is ready, and its
 * notification stays, however long it waits, until the pointer dismisses it.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-button', x: 0.5, y: 2 },
  { to: '.env-button', x: 0.55, y: 0.55, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 4500 },
  { to: dismiss, x: 0.5, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 720 },
];

function Exporting() {
  usePointer(script);
  return <ExportReady />;
}

/** An export that finishes later, its notification kept until a pointer no one sees dismisses it. */
export default function ExportReadyMotion() {
  return (
    <MotionStage label="a notification kept until it is dismissed" height="16rem">
      <Exporting />
    </MotionStage>
  );
}
