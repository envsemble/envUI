import { useState } from 'react';
import FirstMessage from '../../examples/conversation/FirstMessage';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const suggestion = '[data-env-layout="row"] > .env-button:nth-child(3)';

/*
 * The pointer presses "What is still open for the launch?": it becomes the first message, the
 * suggestions leave, and the reply arrives. Then the conversation starts anew, the welcome showing
 * through as the thread fades out over it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: suggestion, x: 0.5, y: 1.8 },
  { to: suggestion, x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 3600 },
  { cue: 'renew' },
  { wait: 700 },
];

function Asking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round} crossfade>
      <FirstMessage />
    </Renew>
  );
}

/** The welcome's suggestions, one pressed by a pointer no one sees as the first message. */
export default function FirstMessageMotion() {
  return (
    <MotionStage label="a suggestion sent as the first message">
      <Asking />
    </MotionStage>
  );
}
