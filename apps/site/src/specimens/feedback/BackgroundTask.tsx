import { useState } from 'react';
import BackgroundTask from '../../examples/feedback/BackgroundTask';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The pointer presses Export report: the button shows it is working, and the page says it is
 * preparing the file. When it is ready, a notification with Download arrives at the stage's edge,
 * and the page keeps the file's link below the button. The pointer presses Download, and the
 * notification goes. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.5, y: 2.4 },
  { to: '.env-button', x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 300 },
  { to: '.env-button', x: 1.6, y: 2.4, duration: 500 },
  // The export's time, and a moment with the notification and the link.
  { wait: 6400 },
  { to: '.env-toast-action', x: 0.5, y: 0.55, duration: 700 },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Exporting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The button at the top, with room below it for the page's line and the notification.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '11rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 24rem)' }}>
          <BackgroundTask />
        </div>
      </Renew>
    </div>
  );
}

/** A report exported by a pointer no one sees, and the notification that it is ready. */
export default function BackgroundTaskMotion() {
  return (
    <MotionStage label="the report exported and ready">
      <Exporting />
    </MotionStage>
  );
}
