import { useEffect, useState } from 'react';
import AsyncWithError from '../../examples/confirm-dialog/AsyncWithError';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const confirm = '.env-dialog-actions .env-button:last-child';

/*
 * The pointer opens the dialog and confirms: the confirm button works while the archive runs,
 * which fails, and the error shows above the buttons with the dialog still open. The pointer
 * confirms again, which succeeds, and the dialog closes. The example is drawn anew at the end, so
 * its first attempt fails again and what it says it archived is gone.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: confirm, x: 0.5, y: 0.6, duration: 550 },
  { wait: 300 },
  { click: true },
  // The archive takes 1.2 s, and fails.
  { wait: 3300 },
  { to: confirm, x: 0.5, y: 0.6, duration: 300 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 3600 },
  { cue: 'again' },
  { wait: 300 },
];

function Archiving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  // The dialog reports the failed archive as an uncaught error would be; the figure fails on
  // purpose every time it plays, so its failures stay out of the reader's console.
  useEffect(() => {
    const quiet = (event: ErrorEvent) => {
      if ((event.error as Error | undefined)?.message === 'Archive failed') event.preventDefault();
    };
    window.addEventListener('error', quiet);
    return () => window.removeEventListener('error', quiet);
  }, []);
  return (
    // As tall as the button and what it says it archived, so the button stays put as that comes.
    <div style={{ minBlockSize: '5rem' }}>
      <AsyncWithError key={round} />
    </div>
  );
}

/** The archive that fails once, confirmed again by a pointer no one sees. */
export default function AsyncWithErrorMotion() {
  return (
    <MotionStage label="the action failing and succeeding" height="22rem">
      <Archiving />
    </MotionStage>
  );
}
