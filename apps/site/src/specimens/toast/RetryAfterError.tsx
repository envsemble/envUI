import { useState } from 'react';
import RetryAfterError from '../../examples/toast/RetryAfterError';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const retry = '.env-toast[data-tone="danger"] .env-toast-action';

/*
 * The pointer presses Publish: it fails, and a danger notification with Try again stays. The
 * pointer presses Try again, the button works once more, and a success follows and closes by
 * itself. Then the page starts anew, its first attempt failing again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button', x: 0.5, y: 2 },
  { to: '.env-button', x: 0.55, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 2900 },
  { to: retry, duration: 700 },
  { wait: 500 },
  { click: true },
  { wait: 200 },
  { leave: true },
  // The success arrives once publishing ends, and is gone well before the page starts anew.
  { wait: 11500 },
  { cue: 'renew' },
  { wait: 600 },
];

function Publishing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <RetryAfterError />
    </Renew>
  );
}

/** Publish failing once and tried again by a pointer no one sees. */
export default function RetryAfterErrorMotion() {
  return (
    <MotionStage label="a failure tried again from its notification" height="18rem">
      <Publishing />
    </MotionStage>
  );
}
