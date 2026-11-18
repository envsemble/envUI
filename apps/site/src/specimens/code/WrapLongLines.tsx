import { cloneElement, useState } from 'react';
import { Column, Text } from '@envsemble/envui';
import WrapLongLines from '../../examples/code/WrapLongLines';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const exampleBlock = WrapLongLines();

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-code-block pre', x: 0.6, y: 0.5 },
  { wait: 180 },
  { wheel: 520, axis: 'x', duration: 1400 },
  { wait: 420 },
  { wheel: -520, axis: 'x', duration: 900 },
  { wait: 180 },
  { leave: true },
  { wait: 180 },
  { cue: 'wrap' },
  { wait: 1560 },
  { cue: 'scroll' },
  { wait: 360 },
];

function Toggling() {
  const [wrap, setWrap] = useState(false);
  usePointer(script, { onCue: (cue) => setWrap(cue === 'wrap') });
  const shownBlock = cloneElement(exampleBlock, { wrap, style: { gridArea: '1 / 1' } });
  const hiddenWrappedBlockKeepingHeight = cloneElement(exampleBlock, {
    wrap: true,
    style: { gridArea: '1 / 1', visibility: 'hidden' },
  });
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 30rem)' }}>
      <Text variant="caption" emphasis="muted">
        {wrap ? 'Wrap' : 'Scroll'}
      </Text>
      <div style={{ display: 'grid', alignItems: 'start' }}>
        {shownBlock}
        {hiddenWrappedBlockKeepingHeight}
      </div>
    </Column>
  );
}

export default function WrapLongLinesMotion() {
  return (
    <MotionStage label="the long line scrolling, then wrapping">
      <Toggling />
    </MotionStage>
  );
}
