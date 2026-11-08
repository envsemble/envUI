import { useState } from 'react';
import AttachDocuments from '../../examples/drop-zone/AttachDocuments';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

/*
 * The pointer carries two documents in at once and drops them on the zone: the list of attached
 * documents appears below it, each with Remove. The pointer removes the first. Then the example
 * starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { carry: 'Launch brief.pdf', as: 'application/pdf' },
  { carry: 'Budget 2027.xlsx', as: 'application/vnd.ms-excel' },
  { to: zone, x: 1.1, y: 1.6 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 600 },
  { drop: true },
  { wait: 1300 },
  { to: '.env-list-item:first-child .env-button', x: 0.5, y: 0.55, duration: 650 },
  { wait: 350 },
  { click: true },
  { wait: 1400 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Attaching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the zone with both documents listed, so the zone stays put as the list grows.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '12.5625rem',
      }}
    >
      <Renew round={round}>
        <AttachDocuments />
      </Renew>
    </div>
  );
}

/** Two documents dropped at once by a pointer no one sees, then one removed. */
export default function AttachDocumentsMotion() {
  return (
    <MotionStage label="two documents attached and one removed">
      <Attaching />
    </MotionStage>
  );
}
