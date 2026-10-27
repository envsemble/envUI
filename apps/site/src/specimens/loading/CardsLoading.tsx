import { useState } from 'react';
import CardsLoading from '../../examples/loading/CardsLoading';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

/*
 * The page opens anew each round: the cards show as their skeletons, the highlight sweeping
 * across them, until the projects land in the same places; a while to read them, and again. The
 * example's own load takes 1.6 s; the waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [{ cue: 'open' }, { wait: 7000 }];

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
