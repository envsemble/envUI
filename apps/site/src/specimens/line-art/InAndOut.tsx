import { useRef, useState } from 'react';
import { LineArt, Surface, type LineArtMotion } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { useHeldAnimations } from '../../previews/HeldAnimations';
import { usePlayback } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/**
 * The drawing whole at first, as a paused figure shows it; playing, it disappears, and from
 * nothing appears and disappears by turns.
 */
function Looping() {
  const { playing } = usePlayback();
  const [motion, setMotion] = useState<LineArtMotion>();
  if (playing && !motion) setMotion('disappear');
  const box = useRef<HTMLDivElement>(null);
  useHeldAnimations(box);
  return (
    <Surface
      ref={box}
      background="default"
      padding={0}
      style={{ overflow: 'hidden', inlineSize: '20rem', aspectRatio: '480 / 330' }}
    >
      <LineArt drawing="harmonic-division" motion={motion} onMotionEnd={() => setMotion('loop')} />
    </Surface>
  );
}

/** A drawing whose lines draw themselves out and in again, in the order of its construction. */
export default function InAndOut() {
  return (
    <Example size="content">
      <MotionStage label="the drawing appearing and disappearing">
        <Looping />
      </MotionStage>
    </Example>
  );
}
