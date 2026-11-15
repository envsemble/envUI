import SupportingPane from '../../examples/panes/SupportingPane';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-panes-trigger', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 1320 },
  { to: '.env-panes-close .env-button', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 540 },
];

function Opening() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <SupportingPane />
    </div>
  );
}

export default function SupportingPaneMotion() {
  return (
    <MotionStage label="the details opening from the button">
      <Opening />
    </MotionStage>
  );
}
