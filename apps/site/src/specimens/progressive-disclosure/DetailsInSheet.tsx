import DetailsInSheet from '../../examples/progressive-disclosure/DetailsInSheet';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item) .env-button`;
const close = '.env-sheet [aria-label="Close details"]';

/*
 * The pointer opens Mobile release: the sheet slides over with its details while the list stays
 * in place beneath it; then it closes the sheet.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: row(2), x: 0.4, y: 2.2 },
  { to: row(2), x: 0.4, y: 0.6, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 1200 },
  { to: close, duration: 650 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 420 },
];

function Opening() {
  usePointer(script);
  return <DetailsInSheet />;
}

/** A project's details in a sheet over the list, opened and closed by a pointer no one sees. */
export default function DetailsInSheetMotion() {
  return (
    <MotionStage label="the details opening in a sheet" height="22rem">
      <Opening />
    </MotionStage>
  );
}
