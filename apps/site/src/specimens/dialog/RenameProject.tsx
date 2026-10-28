import { useState } from 'react';
import RenameProject from '../../examples/dialog/RenameProject';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const field = '.env-dialog-popup input';

/*
 * The pointer opens Rename project, deletes "launch" from the name and types "website",
 * then presses Enter: Save name spins and Cancel is disabled while the name saves. The dialog
 * closes, and the name above the button reads Northwind website. Then the example starts anew.
 * The example's save takes 2 s; the waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 800 },
  { to: field, x: 0.6, y: 0.62, duration: 600 },
  { wait: 150 },
  { click: true },
  { erase: 6, into: field, every: 90 },
  { wait: 200 },
  { type: 'website', into: field, every: 150 },
  { wait: 500 },
  { key: 'Enter', on: field },
  { wait: 400 },
  { to: '.env-dialog-actions .env-button:first-child', x: 0.5, y: 0.6, duration: 500 },
  { wait: 3500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Renaming() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      {/* As wide as the longer name, so the button stays put as the name changes. */}
      <div style={{ inlineSize: '9rem' }}>
        <RenameProject />
      </div>
    </Renew>
  );
}

/** A project renamed in a dialog that waits while the name saves, by a pointer no one sees. */
export default function RenameProjectMotion() {
  return (
    <MotionStage label="the dialog waiting while the name saves" height="21rem">
      <Renaming />
    </MotionStage>
  );
}
