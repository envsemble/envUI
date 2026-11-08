import { useState } from 'react';
import ExportMembers from '../../examples/progress/ExportMembers';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The pointer presses Export members: the bar sweeps while the export is prepared, shows its share
 * once the amount is known, and the result takes its place. The example is drawn anew at the end.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 300 },
  { leave: true },
  // Preparing takes 1.2 s, the export 2.4 s; then the result stays a moment.
  { wait: 8600 },
  { cue: 'again' },
  { wait: 700 },
];

function Exporting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the button, the bar and the result, so nothing moves as they come.
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ inlineSize: 'min(100%, 22rem)', minBlockSize: '7.5rem' }}>
        <Renew round={round}>
          <ExportMembers />
        </Renew>
      </div>
    </div>
  );
}

/** The export from its press to its result: preparing, a known share, and done. */
export default function ExportMembersMotion() {
  return (
    <MotionStage label="the export from preparing to done">
      <Exporting />
    </MotionStage>
  );
}
