import { useLayoutEffect, useRef, useState } from 'react';
import { Spinner } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

/** It turns while the tile plays. */
const script: PointerStep[] = [{ cue: 'turn' }, { wait: 2800 }];

/**
 * A large spinner. Its still is its turn held at a moment where the arc is long, so it reads as a
 * spinner, not a dot; playing, it turns from there with its own motion. Stopped, the tile is drawn
 * anew, held at that moment again.
 */
export default function SpinnerTile() {
  const [turning, setTurning] = useState(false);
  usePointer(script, { onCue: () => setTurning(true) });
  const spinner = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    // The spinner's own animations, on its drawing and its arc, held or let run.
    for (const part of spinner.current?.querySelectorAll<SVGElement>('svg, circle') ?? []) {
      part.style.animationDelay = '-0.75s';
      part.style.animationPlayState = turning ? 'running' : 'paused';
    }
  }, [turning]);
  return <Spinner ref={spinner} size="lg" label="Loading" />;
}
