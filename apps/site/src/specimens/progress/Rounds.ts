import { useRef, type CSSProperties } from 'react';

const fadeMs = 200;

export function useRounds(step: number, restartStep: number) {
  const seen = useRef({ step, round: 0 });
  if (seen.current.step !== step) {
    if (step === restartStep) seen.current.round++;
    seen.current.step = step;
  }
  const fadedOutBeforeRestart = step === restartStep - 1;
  const style: CSSProperties = {
    opacity: fadedOutBeforeRestart ? 0 : 1,
    transition: `opacity ${fadeMs}ms ease`,
  };
  return { round: seen.current.round, style };
}
