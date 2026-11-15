import { useState } from 'react';
import Reorder from '../../examples/list/Reorder';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';

const handle = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-list-item-handle`;
const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: handle(4), x: 0.5, y: 0.5 },
  { wait: 240 },
  { press: true },
  { to: row(1), x: 0.04, y: 1.25, duration: 1100 },
  { wait: 150 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
  { focus: handle(2) },
  { wait: 300 },
  { cue: 'Space' },
  { key: ' ' },
  { wait: 390 },
  { cue: '↓' },
  { key: 'ArrowDown' },
  { wait: 330 },
  { cue: '↓' },
  { key: 'ArrowDown' },
  { wait: 390 },
  { cue: 'Space' },
  { key: ' ' },
  { wait: 420 },
  { cue: 'done' },
  { blur: true },
  { wait: 420 },
];

const scrollerCatchingDragAutoscroll = {
  position: 'relative',
  overflowY: 'auto',
  scrollbarWidth: 'none',
  paddingBlock: '3.5rem',
  marginBlock: '-3.5rem',
} as const;
const onePixelOverflowSoItScrolls = {
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
      <div style={scrollerCatchingDragAutoscroll}>
        <div style={onePixelOverflowSoItScrolls} />
        <Reorder />
      </div>
    </>
  );
}

export default function ReorderMotion() {
  return (
    <MotionStage label="the rows put in order">
      <Reordering />
    </MotionStage>
  );
}
