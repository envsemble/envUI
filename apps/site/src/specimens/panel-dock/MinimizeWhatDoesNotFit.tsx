import { useState } from 'react';
import MinimizeWhatDoesNotFit from '../../examples/panel-dock/MinimizeWhatDoesNotFit';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';
import { WidthSweep } from '../../motion/WidthSweep';

const tab = (label: string) => `.env-panel-dock-tab-restore[aria-label="Show ${label}"]`;

/*
 * A region with room for two panels. The pointer opens the support queue from its tab, and the
 * release checklist, used longest ago, drops to a tab in its place. The dock is drawn anew at the
 * end, as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: tab('Support queue') },
  { wait: 400 },
  { click: true },
  { wait: 2600 },
  { leave: true },
  { wait: 400 },
  { cue: 'again' },
  { wait: 900 },
];

function MakingRoom() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  // A frame as wide as two panels at their least width, drawn smaller where the stage is narrower.
  return (
    <WidthSweep widths={[44]} at={0} ruler={false} outline={false}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <MinimizeWhatDoesNotFit />
        </div>
      </Renew>
    </WidthSweep>
  );
}

/** Panels opened from their tabs, the one used longest ago minimized to make room. */
export default function MinimizeWhatDoesNotFitMotion() {
  return (
    <MotionStage label="the panel used longest ago making room">
      <MakingRoom />
    </MotionStage>
  );
}
