import { useState } from 'react';
import RenameInPlace from '../../examples/popover/RenameInPlace';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-popover .env-text-field-input';

/*
 * The pointer presses Rename, and the popover opens with the name in its field; it takes "plan.md"
 * off the end, types "brief.md" and presses Rename in the popover, which closes as the title takes
 * the new name. The example is drawn anew at the end, with its first name.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 700 },
  { to: field, x: 0.92, y: 0.6, duration: 600 },
  { wait: 200 },
  { click: true },
  { wait: 300 },
  { erase: 7, into: field, every: 90 },
  { wait: 250 },
  { type: 'brief.md', into: field, every: 120 },
  { wait: 500 },
  { to: '.env-popover button[type="submit"]', duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1800 },
  { leave: true },
  { wait: 300 },
  { cue: 'again' },
  { wait: 700 },
];

function Renaming() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The title and trigger at the top of a box as tall as they and the open popover, so the
    // popover fits in the stage from the start.
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ minBlockSize: '15rem' }}>
        <Renew round={round}>
          <RenameInPlace />
        </Renew>
      </div>
    </div>
  );
}

/** A document renamed in a popover that opens from its button, by a pointer no one sees. */
export default function RenameInPlaceMotion() {
  return (
    <MotionStage label="the document renamed in the popover">
      <Renaming />
    </MotionStage>
  );
}
