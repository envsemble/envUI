import ExportReady from '../../examples/toast/ExportReady';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const dismiss = '.env-toast .env-toast-dismiss';

/*
 * The pointer presses Export members and moves away: a moment later the export is ready, and its
 * notification stays, however long it waits, until the pointer dismisses it.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button', x: 0.5, y: 2 },
  { to: '.env-button', x: 0.55, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 7500 },
  { to: dismiss, x: 0.5, y: 0.5 },
  { wait: 500 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1200 },
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
