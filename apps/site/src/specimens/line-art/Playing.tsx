import { useRef } from 'react';
import { LineArt, Surface } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { useHeldAnimations } from '../../previews/HeldAnimations';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/** The drawing at rest, then playing once, a little longer than its motion takes, which ends still. */
const steps = [1500, 6500];

function Played() {
  const step = useTimeline(steps);
  const box = useRef<HTMLDivElement>(null);
  useHeldAnimations(box);
  return (
    <Surface
      ref={box}
      background="default"
      padding={0}
      style={{ overflow: 'hidden', inlineSize: '20rem', aspectRatio: '480 / 330' }}
    >
      <LineArt drawing="golden-section" motion={step === 1 ? 'play' : undefined} />
    </Surface>
  );
}

/** A drawing playing: its lines run out and draw themselves in again, and it rests whole. */
export default function Playing() {
  return (
    <Example size="content">
      <MotionStage label="the drawing playing">
        <Played />
      </MotionStage>
    </Example>
  );
}
