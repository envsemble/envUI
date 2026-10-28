import { useState } from 'react';
import ImmediateToggles from '../../examples/settings/ImmediateToggles';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

/** A setting's switch, by the id of its row's title. */
const setting = (id: string) => `.env-list-item:has([id$="-${id}-title"]) .env-switch`;

/*
 * The pointer turns off Weekly summary: the switch shows it, and nothing else changes. It turns on
 * Show me in the directory, which shows nowhere on the page, and a notification says so, then
 * leaves by itself. Then the settings start anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: setting('summary'), x: 0.5, y: 2.5 },
  { to: setting('summary'), x: 0.5, y: 0.5, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1200 },
  { to: setting('directory'), x: 0.5, y: 0.5, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  // The notification's own time on the stage, and its leaving.
  { wait: 9500 },
  { cue: 'renew' },
  { wait: 600 },
];

function Switching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The settings at the top, with room below them for the notification.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '28.5rem',
      }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 30rem)' }}>
          <ImmediateToggles />
        </div>
      </Renew>
    </div>
  );
}

/** Settings that apply as they are switched, and the one change that is told, by a notification. */
export default function ImmediateTogglesMotion() {
  return (
    <MotionStage label="the settings applying as they switch">
      <Switching />
    </MotionStage>
  );
}
