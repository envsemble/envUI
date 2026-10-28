import DetailsInSheet from '../../examples/progressive-disclosure/DetailsInSheet';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item) .env-button`;
const close = '.env-sheet-popup .env-dialog-heading > .env-button';

/*
 * The pointer opens Mobile release: the sheet slides over with its details while the list stays
 * in place beneath it; then it closes the sheet.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: row(2), x: 0.4, y: 2.2 },
  { to: row(2), x: 0.4, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 2000 },
  { to: close, duration: 650 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 700 },
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
