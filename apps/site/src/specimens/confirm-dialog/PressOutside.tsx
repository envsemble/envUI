import DeleteProject from '../../examples/confirm-dialog/DeleteProject';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: '.env-dialog-backdrop', x: 0.1, y: 0.75, duration: 550 },
  { wait: 150 },
  { click: true },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 650 },
  { wait: 210 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 540 },
];

function PressingOutside() {
  usePointer(script);
  return <DeleteProject />;
}

export default function PressOutsideMotion() {
  return (
    <MotionStage label="a press outside leaving the dialog open" height="18rem">
      <PressingOutside />
    </MotionStage>
  );
}
