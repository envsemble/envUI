import { useState } from 'react';
import FormattingToolbar from '../../examples/toolbar/FormattingToolbar';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const bold = '.env-toolbar-button[aria-label="Bold"]';

/*
 * The pointer rests on Bold: after a moment its tooltip names it with its shortcut. It presses
 * Bold, which stays pressed, and leaves. Then the toolbar starts anew, Bold not pressed.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: bold, x: 0.5, y: 2.4 },
  { to: bold, x: 0.5, y: 0.55, duration: 450 },
  { wait: 1500 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 1500 },
  { cue: 'renew' },
  { wait: 600 },
];

function Formatting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // Room above the toolbar for the tooltip, so the figure keeps its height.
    <div style={{ display: 'grid', alignContent: 'end', inlineSize: '100%', blockSize: '5.5rem' }}>
      <Renew round={round}>
        <FormattingToolbar />
      </Renew>
    </div>
  );
}

/** The formatting toolbar: Bold named in its tooltip and pressed by a pointer no one sees. */
export default function FormattingToolbarMotion() {
  return (
    <MotionStage label="Bold's tooltip and Bold pressed">
      <Formatting />
    </MotionStage>
  );
}
