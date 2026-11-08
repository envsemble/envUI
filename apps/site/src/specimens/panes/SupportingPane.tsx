import SupportingPane from '../../examples/panes/SupportingPane';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/*
 * Narrow, the details wait in a sheet: the pointer presses Details, and the sheet rises over the
 * report with its owner and due date; it closes the sheet again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-panes-trigger', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 2200 },
  { to: '.env-panes-close .env-button', duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 900 },
];

function Opening() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <SupportingPane />
    </div>
  );
}

/** The report's details in a sheet that Details opens, where the panes don't fit side by side. */
export default function SupportingPaneMotion() {
  return (
    <MotionStage label="the details opening from the button">
      <Opening />
    </MotionStage>
  );
}
