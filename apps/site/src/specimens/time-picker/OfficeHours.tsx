import { useState } from 'react';
import OfficeHours from '../../examples/time-picker/OfficeHours';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { Renew } from '../../motion/Renew';
import { remPixels } from '../../shared/Lengths';

const field = '.env-date-picker-control';
const hours = '.env-time-list-column[data-part="hour"]';

const examplesMaxHour = 18;

function wheelRowHeightPx() {
  const root = document.querySelector('.env-theme') ?? document.documentElement;
  const style = getComputedStyle(root);
  const rem = remPixels();
  const length = (name: string) => (parseFloat(style.getPropertyValue(name)) || 0) * rem;
  return matchMedia('(pointer: coarse)').matches
    ? length('--env-control-height-touch')
    : length('--env-row-height') - 0.25 * rem;
}

function hourTheWheelOpensOn() {
  const time = new Date();
  const nowToTheHalfHour = Math.round((time.getHours() * 60 + time.getMinutes()) / 30) * 30;
  return Math.floor(nowToTheHalfHour / 60) % 24;
}

function scriptOf(row: number, from: number): PointerStep[] {
  const rows = examplesMaxHour - from;
  return [
    { wait: 240 },
    { to: field, x: 0.4, y: 2 },
    { to: field, x: 0.4, y: 0.5, duration: 450 },
    { wait: 120 },
    { click: true },
    { wait: 540 },
    { to: hours, x: 0.5, y: 0.5, duration: 500 },
    { wait: 120 },
    { wheel: rows * row, duration: Math.max(600, Math.abs(rows) * 280) },
    { wait: 360 },
    { wheel: row, duration: 500 },
    { wait: 1020 },
    { cue: 'escape' },
    { key: 'Escape', on: '.env-date-picker-popup' },
    { leave: true },
    { wait: 840 },
    { cue: 'renew' },
    { wait: 360 },
  ];
}

function Booking() {
  const [round, setRound] = useState(0);
  const [escapes, setEscapes] = useState(0);
  const [script] = useState(() => scriptOf(wheelRowHeightPx(), hourTheWheelOpensOn()));
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
      <div style={{ display: 'grid', inlineSize: '100%', blockSize: rowsAnd(7.125, 1.625) }}>
        <Renew round={round}>
          <OfficeHours />
        </Renew>
      </div>
    </>
  );
}

export default function OfficeHoursMotion() {
  return (
    <MotionStage label="the hour wheel stopping at the last hour">
      <Booking />
    </MotionStage>
  );
}
