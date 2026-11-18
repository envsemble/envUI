import { useState } from 'react';
import FormattingToolbar from '../../examples/toolbar/FormattingToolbar';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const bold = '.env-toolbar-button[aria-label="Bold"]';
const toolbarWithTooltipAboveHeight = '5.5rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: bold, x: 0.5, y: 2.4 },
  { to: bold, x: 0.5, y: 0.55, duration: 450 },
  { wait: 900 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 900 },
  { cue: 'renew' },
  { wait: 360 },
];

function Formatting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'end',
        inlineSize: '100%',
        blockSize: toolbarWithTooltipAboveHeight,
      }}
    >
      <Renew round={round}>
        <FormattingToolbar />
      </Renew>
    </div>
  );
}

export default function FormattingToolbarMotion() {
  return (
    <MotionStage label="Bold's tooltip and Bold pressed">
      <Formatting />
    </MotionStage>
  );
}
