import { useState } from 'react';
import MinimizeWhatDoesNotFit from '../../examples/panel-dock/MinimizeWhatDoesNotFit';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';
import { WidthSweep } from '../../motion/WidthSweep';

const tab = (label: string) => `.env-panel-dock-tab-restore[aria-label="Show ${label}"]`;

const twoPanelsAtLeastWidthRem = 44;

const script: PointerStep[] = [
  { wait: 300 },
  { to: tab('Support queue') },
  { wait: 240 },
  { click: true },
  { wait: 1560 },
  { leave: true },
  { wait: 240 },
  { cue: 'again' },
  { wait: 540 },
];

function MakingRoom() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <WidthSweep widths={[twoPanelsAtLeastWidthRem]} at={0} ruler={false} outline={false}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <MinimizeWhatDoesNotFit />
        </div>
      </Renew>
    </WidthSweep>
  );
}

export default function MinimizeWhatDoesNotFitMotion() {
  return (
    <MotionStage label="the panel used longest ago making room">
      <MakingRoom />
    </MotionStage>
  );
}
