import InspectorPanel from '../../examples/sheet/InspectorPanel';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item) .env-button`;
const close = '.env-sheet [aria-label="Close details"]';

/*
 * The pointer presses Alex Morgan, and the sheet opens beside the list, which stays usable; it
 * presses Sam Lee, and the sheet shows Sam in place; then it closes the sheet.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: row(1), x: 0.5, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1400 },
  { to: row(2), x: 0.5, y: 0.6, duration: 600 },
  { wait: 350 },
  { click: true },
  { wait: 1400 },
  { to: close, duration: 650 },
  { wait: 350 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 700 },
];

function Inspecting() {
  usePointer(script);
  // The list at the start of the stage, as on a page, with the sheet at its end.
  return (
    <div style={{ justifySelf: 'stretch' }}>
      <InspectorPanel />
    </div>
  );
}

/** People in a list, each shown in a sheet beside it as the pointer presses them. */
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
