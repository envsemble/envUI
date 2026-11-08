import { useState } from 'react';
import OfficeHours from '../../examples/time-picker/OfficeHours';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { Renew } from '../../motion/Renew';
import { remPixels } from '@envui-internal/internal/lengths';

const field = '.env-date-picker-control';
const hours = '.env-time-list-column[data-part="hour"]';

/** The last hour the wheel offers, the example's `max`. */
const lastHour = 18;

/**
 * A row of the time wheels, in px, as TimeList.css sets it: a calendar day's height, a touch
 * target's on a coarse pointer.
 */
function rowHeight() {
  const root = document.querySelector('.env-theme') ?? document.documentElement;
  const style = getComputedStyle(root);
  const rem = remPixels();
  const length = (name: string) => (parseFloat(style.getPropertyValue(name)) || 0) * rem;
  return matchMedia('(pointer: coarse)').matches
    ? length('--env-control-height-touch')
    : length('--env-row-height') - 0.25 * rem;
}

/** The hour the empty field's wheel opens on: now, to the half hour, as TimeList starts. */
function startHour() {
  const time = new Date();
  const minutes = Math.round((time.getHours() * 60 + time.getMinutes()) / 30) * 30;
  return Math.floor(minutes / 60) % 24;
}

/*
 * The pointer opens the empty field: the wheels offer only the hours from 08 to 18 and the half
 * hours. It turns the hour wheel slowly on to the last hour, one row at a time from the hour it
 * opens on, and turns it a little further, where it stops at the bound and settles back on 18.
 * Esc closes the popup, and the field starts anew, empty.
 */
function scriptOf(row: number, from: number): PointerStep[] {
  const rows = lastHour - from;
  return [
    { wait: 400 },
    { to: field, x: 0.4, y: 2 },
    { to: field, x: 0.4, y: 0.5, duration: 450 },
    { wait: 200 },
    { click: true },
    { wait: 900 },
    { to: hours, x: 0.5, y: 0.5, duration: 500 },
    { wait: 200 },
    { wheel: rows * row, duration: Math.max(600, Math.abs(rows) * 280) },
    { wait: 600 },
    { wheel: row, duration: 500 },
    { wait: 1700 },
    { cue: 'escape' },
    { key: 'Escape', on: '.env-date-picker-popup' },
    { leave: true },
    { wait: 1400 },
    { cue: 'renew' },
    { wait: 600 },
  ];
}

function Booking() {
  const [round, setRound] = useState(0);
  const [escapes, setEscapes] = useState(0);
  const [script] = useState(() => scriptOf(rowHeight(), startHour()));
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
      {/* The field at the top of the room its popup opens into, below it, as tall as the two are
          open, so they sit in the middle of the stage. */}
      <div style={{ display: 'grid', inlineSize: '100%', blockSize: rowsAnd(7.125, 1.625) }}>
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
