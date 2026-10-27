import { useState } from 'react';
import StartTime from '../../examples/time-picker/StartTime';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { PressedKeys } from '../../previews/PressedKeys';
import { Renew } from '../../previews/Renew';

const field = '.env-date-picker-control';
const wheel = (part: string) => `.env-time-list-column[data-part="${part}"]`;
const row = (part: string, value: string) =>
  `${wheel(part)} .env-time-list-row[data-value="${value}"]`;

/*
 * The pointer opens the field on 9:30 AM and turns the hour wheel on to 1, then picks PM on the
 * third wheel, and Esc closes the popup on 1:30 PM. Then the field starts anew, on 9:30 AM.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: field, x: 0.4, y: 2 },
  { to: field, x: 0.4, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: wheel('hour'), x: 0.5, y: 0.5, duration: 500 },
  { wait: 200 },
  { wheel: 200, duration: 1100 },
  { wait: 700 },
  { to: row('dayPeriod', '1'), duration: 550 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-date-picker-popup' },
  { leave: true },
  { wait: 1500 },
  { cue: 'renew' },
  { wait: 600 },
];

function Choosing() {
  const [round, setRound] = useState(0);
  const [escapes, setEscapes] = useState(0);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'escape') return setEscapes((count) => count + 1);
      setEscapes(0);
      setRound((count) => count + 1);
    },
  });
  return (
    <>
      <PressedKeys keys={escapes ? ['Esc'] : null} press={escapes} />
      {/* The field at the top of the room its popup opens into, below it. */}
      <div style={{ display: 'grid', inlineSize: '100%', blockSize: '22rem' }}>
        <Renew round={round}>
          <StartTime />
        </Renew>
      </div>
    </>
  );
}

/** The workshop's start, moved to the afternoon on the wheels by a pointer no one sees. */
export default function StartTimeMotion() {
  return (
    <MotionStage label="the hour wheel turned and PM chosen">
      <Choosing />
    </MotionStage>
  );
}
