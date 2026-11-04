import { useState } from 'react';
import FirstUse from '../../examples/empty-states/FirstUse';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The pointer presses Create project in the empty state: the first project takes the state's
 * place, and the page's own Create project appears beside its heading. Then the example starts
 * anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-surface .env-button', x: 0.5, y: 2 },
  { to: '.env-surface .env-button', x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 2400 },
  { cue: 'renew' },
  { wait: 700 },
];

function Creating() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the empty state, so the heading keeps its place as the list takes the state's.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '21rem' }}
    >
      <Renew round={round}>
        {/* As wide as the empty state, which the list then takes. */}
        <div style={{ inlineSize: 'min(100%, 34rem)' }}>
          <FirstUse />
        </div>
      </Renew>
    </div>
  );
}

/** The first-use state, whose action a pointer no one sees presses: the page takes over. */
export default function FirstUseMotion() {
  return (
    <MotionStage label="the first project created">
      <Creating />
    </MotionStage>
  );
}
