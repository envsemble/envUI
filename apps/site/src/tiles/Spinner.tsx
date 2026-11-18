import { useLayoutEffect, useRef, useState } from 'react';
import { Spinner } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const script: PointerStep[] = [{ cue: 'turn' }, { wait: 1680 }];

const longArcMoment = '-0.75s';

export default function SpinnerTile() {
  const [turning, setTurning] = useState(false);
  usePointer(script, { onCue: () => setTurning(true) });
  const spinner = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    for (const part of spinner.current?.querySelectorAll<SVGElement>('svg, circle') ?? []) {
      part.style.animationDelay = longArcMoment;
      part.style.animationPlayState = turning ? 'running' : 'paused';
    }
  }, [turning]);
  return <Spinner ref={spinner} size="lg" label="Loading" />;
}
