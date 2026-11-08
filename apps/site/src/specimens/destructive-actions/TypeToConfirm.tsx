import { useState } from 'react';
import TypeToConfirm from '../../examples/destructive-actions/TypeToConfirm';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-text-field-input';
const confirm = '.env-dialog-actions .env-button:last-child';

/*
 * The pointer opens the dialog and types the name with a slip: Delete project stays disabled, and
 * the pointer drifts towards it and back. It mends the name, the button enables, and it presses
 * it; the dialog closes. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.5, y: 2 },
  { to: '.env-button', x: 0.5, y: 0.6, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { to: field, x: 0.3, y: 0.5, duration: 500 },
  { click: true },
  { type: 'Data migraton', into: field, every: 80 },
  { wait: 300 },
  { to: confirm, x: 0.5, y: 0.6, duration: 500 },
  { wait: 1100 },
  { to: field, x: 0.6, y: 0.5, duration: 450 },
  { wait: 250 },
  { erase: 3, into: field, every: 90 },
  { type: 'tion', into: field, every: 90 },
  { wait: 900 },
  { to: confirm, x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Confirming() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the button with the line below it, so the button keeps its place as the line
    // comes and goes.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '5rem' }}
    >
      <Renew round={round}>
        <TypeToConfirm />
      </Renew>
    </div>
  );
}

/** A deletion confirmed by typing the project's name, by a pointer no one sees. */
export default function TypeToConfirmMotion() {
  return (
    <MotionStage label="the name typed to confirm" height="24rem">
      <Confirming />
    </MotionStage>
  );
}
