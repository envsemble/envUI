import { useState } from 'react';
import OfficeHours from '../../examples/time-picker/OfficeHours';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { Renew } from '../../motion/Renew';

const field = '.env-date-picker-control';
const hours = '.env-time-list-column[data-part="hour"]';

/*
 * The pointer opens the empty field: the wheels offer only the hours from 08 to 18 and the half
 * hours. It turns the hour wheel on to the last hour, where it stops, and Esc closes the popup.
 * Then the field starts anew, empty.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: field, x: 0.4, y: 2 },
  { to: field, x: 0.4, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: hours, x: 0.5, y: 0.5, duration: 500 },
  { wait: 200 },
  { wheel: 400, duration: 1500 },
  { wait: 500 },
  { wheel: 80, duration: 400 },
  { wait: 1700 },
  { cue: 'escape' },
  { key: 'Escape', on: '.env-date-picker-popup' },
  { leave: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 600 },
];

function Booking() {
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
          <OfficeHours />
        </Renew>
      </div>
    </>
  );
}

/** Times within office hours, the hour wheel turned to its end by a pointer no one sees. */
export default function OfficeHoursMotion() {
  return (
    <MotionStage label="the hour wheel stopping at the last hour">
      <Booking />
    </MotionStage>
  );
}
