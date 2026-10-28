import { cloneElement, useState } from 'react';
import { Column, Text } from '@envsemble/envui';
import WrapLongLines from '../../examples/code/WrapLongLines';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

// The example's block, whose long lines the figure scrolls, then wraps.
const block = WrapLongLines();

/*
 * The block scrolls its long line: the pointer turns the wheel along it to read the rest, and back.
 * Then the same block wraps the line, and scrolls again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-code-block pre', x: 0.6, y: 0.5 },
  { wait: 300 },
  { wheel: 520, axis: 'x', duration: 1400 },
  { wait: 700 },
  { wheel: -520, axis: 'x', duration: 900 },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
  { cue: 'wrap' },
  { wait: 2600 },
  { cue: 'scroll' },
  { wait: 600 },
];

function Toggling() {
  const [wrap, setWrap] = useState(false);
  usePointer(script, { onCue: (cue) => setWrap(cue === 'wrap') });
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 30rem)' }}>
      <Text variant="caption" emphasis="muted">
        {wrap ? 'Wrap' : 'Scroll'}
      </Text>
      {/* The wrapped block, unseen beneath, keeps the figure as tall as it from the start, so
          only the shown block's end moves as it wraps. */}
      <div style={{ display: 'grid', alignItems: 'start' }}>
        {cloneElement(block, { wrap, style: { gridArea: '1 / 1' } })}
        {cloneElement(block, { wrap: true, style: { gridArea: '1 / 1', visibility: 'hidden' } })}
      </div>
    </Column>
  );
}

/** One settings.json block, its long line scrolled sideways, then wrapped. */
export default function WrapLongLinesMotion() {
  return (
    <MotionStage label="the long line scrolling, then wrapping">
      <Toggling />
    </MotionStage>
  );
}
