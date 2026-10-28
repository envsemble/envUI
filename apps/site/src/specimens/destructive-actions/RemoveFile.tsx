import { useState } from 'react';
import RemoveFile from '../../examples/destructive-actions/RemoveFile';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const remove = '.env-list-item:first-child .env-button';

/*
 * The pointer presses Remove: the button arms in place and reads Remove file. A second press
 * removes the file. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: remove, x: 0.5, y: 2.4 },
  { to: remove, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: remove, x: 0.5, y: 0.55, duration: 250 },
  { click: true },
  { wait: 1300 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Removing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as both files, so the list keeps its place as one leaves.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '8.5rem' }}
    >
      <Renew round={round}>
        <RemoveFile />
      </Renew>
    </div>
  );
}

/** A file removed by a pointer no one sees: one press arms the button, a second confirms. */
export default function RemoveFileMotion() {
  return (
    <MotionStage label="a file removed with a second press">
      <Removing />
    </MotionStage>
  );
}
