import { useState } from 'react';
import Reorder from '../../examples/list/Reorder';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const handle = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-list-item-handle`;
const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;

/*
 * The pointer drags Questions by its handle up to second place, and lets go. Then the keyboard
 * takes over: Space lifts the row, ↓ twice carries it back down, and Space drops it, so the agenda
 * ends in the order it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: handle(4), x: 0.5, y: 0.5 },
  { wait: 400 },
  { press: true },
  // Aimed by the first row, which stays in place as the others make room under the pointer.
  { to: row(1), x: 0.04, y: 1.25, duration: 1100 },
  { wait: 250 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
  { focus: handle(2) },
  { wait: 500 },
  { cue: 'Space' },
  { key: ' ' },
  { wait: 650 },
  { cue: '↓' },
  { key: 'ArrowDown' },
  { wait: 550 },
  { cue: '↓' },
  { key: 'ArrowDown' },
  { wait: 650 },
  { cue: 'Space' },
  { key: ' ' },
  { wait: 700 },
  { cue: 'done' },
  { blur: true },
  { wait: 700 },
];

const dragArea = {
  position: 'relative',
  overflowY: 'auto',
  scrollbarWidth: 'none',
  paddingBlock: '3.5rem',
  marginBlock: '-3.5rem',
} as const;
const overflow = {
  position: 'absolute',
  insetBlockStart: 0,
  inlineSize: 1,
  blockSize: 'calc(100% + 1px)',
} as const;

function Reordering() {
  const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
  usePointer(script, {
    onCue: (cue) =>
      setPressed((last) =>
        cue === 'done' ? null : { keys: [cue], press: (last?.press ?? 0) + 1 },
      ),
  });
  return (
    <>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      {/* A drag near the edge of what scrolls scrolls it, and with no box around the list that
          scrolls, that is the page: a figure near the window's edge would scroll the page under
          the reader. A box around the list that scrolls by a pixel takes that part, and the room
          around the list keeps the pointer clear of its edges, so it never does. */}
      <div style={dragArea}>
        <div style={overflow} />
        <Reorder />
      </div>
    </>
  );
}

/** The agenda put in order by a pointer no one sees, and put back by its keyboard. */
export default function ReorderMotion() {
  return (
    <MotionStage label="the rows put in order">
      <Reordering />
    </MotionStage>
  );
}
