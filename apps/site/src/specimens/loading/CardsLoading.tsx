import { useState } from 'react';
import CardsLoading from '../../examples/loading/CardsLoading';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

/*
 * The page opens anew each round: the cards show as their skeletons, the highlight sweeping
 * across them, until the projects land in the same places; a while to read them, and again. The
 * example's own load takes 1.6 s.
 */
const script: PointerStep[] = [{ cue: 'open' }, { wait: 4200 }];

function Opening() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <CardsLoading />
    </Renew>
  );
}

/** The project cards as their skeletons as the page opens, and the projects landing in them. */
export default function CardsLoadingMotion() {
  return (
    <MotionStage label="the cards loading as the page opens">
      <Opening />
    </MotionStage>
  );
}
