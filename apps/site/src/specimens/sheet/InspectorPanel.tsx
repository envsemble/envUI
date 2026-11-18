import InspectorPanel from '../../examples/sheet/InspectorPanel';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item) .env-button`;
const close = '.env-sheet [aria-label="Close details"]';

const script: PointerStep[] = [
  { wait: 300 },
  { to: row(1), x: 0.5, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 840 },
  { to: row(2), x: 0.5, y: 0.6, duration: 600 },
  { wait: 210 },
  { click: true },
  { wait: 840 },
  { to: close, duration: 650 },
  { wait: 210 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 420 },
];

function Inspecting() {
  usePointer(script);
  return (
    <div style={{ justifySelf: 'stretch' }}>
      <InspectorPanel />
    </div>
  );
}

export default function InspectorPanelMotion() {
  return (
    <MotionStage
      label="the sheet showing each person beside the list"
      height="20rem"
      stage="shaded"
    >
      <Inspecting />
    </MotionStage>
  );
}
