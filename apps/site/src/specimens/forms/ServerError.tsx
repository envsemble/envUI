import { useState } from 'react';
import ServerError from '../../examples/forms/ServerError';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const save = 'button[type="submit"]';

/*
 * The pointer presses Save changes: the button shows it is working, at its size. The server can
 * not be reached: an alert at the top says so, and every value is still there. Then the form
 * starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: save, x: 0.5, y: 2.4 },
  { to: save, x: 0.5, y: 0.55, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 3800 },
  { cue: 'renew' },
  { wait: 700 },
];

function Saving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with its alert, so the figure keeps its height.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '25.5rem',
      }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 32rem)' }}>
          <ServerError />
        </div>
      </Renew>
    </div>
  );
}

/** A save that fails as the server is out of reach, pressed by a pointer no one sees. */
export default function ServerErrorMotion() {
  return (
    <MotionStage label="a save failing and the values kept">
      <Saving />
    </MotionStage>
  );
}
