import { useState } from 'react';
import AdvancedOptions from '../../examples/progressive-disclosure/AdvancedOptions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const summary = '.env-disclosure > summary';
const archived = '.env-disclosure-panel .env-checkbox';

/*
 * The pointer opens Advanced options: the panel slides open with its settings. It ticks Include
 * archived projects, and closes the panel again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: summary, x: 0.15, y: 2.5 },
  { to: summary, x: 0.15, y: 0.55, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: archived, x: 0.08, y: 0.5, duration: 500 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { to: summary, x: 0.15, y: 0.55, duration: 550 },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { leave: true },
  // Closed, the form shows as at the start; drawn anew, unseen, its box is clear again.
  { cue: 'renew' },
  { wait: 360 },
];

function Disclosing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its panel open, so the stage keeps one height as it opens.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '20.25rem',
      }}
    >
      {/* As wide as the form with its panel open, so the form keeps its place as it opens. */}
      <div style={{ inlineSize: 'min(100%, 22rem)' }}>
        <AdvancedOptions key={round} />
      </div>
    </div>
  );
}

/** The export form's advanced options, opened by a pointer no one sees and closed again. */
export default function AdvancedOptionsMotion() {
  return (
    <MotionStage label="the advanced options opening">
      <Disclosing />
    </MotionStage>
  );
}
