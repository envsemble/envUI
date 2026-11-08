import { Column, HoverCard, Link, Text } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer rests on "roadmap", and the card opens after a moment. The pointer moves down onto
 * the card, which stays open while it reads; then it leaves, and the card closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-link', x: 0.5, y: 2.5 },
  { to: '.env-link', x: 0.45, y: 0.6, duration: 500 },
  { wait: 1700 },
  { to: '.env-hover-card', x: 0.35, y: 0.45, duration: 600 },
  { wait: 2000 },
  { to: '.env-hover-card', x: 0.6, y: 1.8, duration: 450 },
  { leave: true },
  { wait: 800 },
];

function Hovering() {
  usePointer(script);
  return (
    // The sentence keeps to the top of the stage, so the card has room to open below it.
    <div style={{ display: 'grid', alignContent: 'start', minBlockSize: '9rem' }}>
      <Text>
        The launch depends on the pricing review and the{' '}
        <HoverCard trigger={<Link href="/documents/roadmap">roadmap</Link>}>
          <Column gap={2}>
            <Text render={<strong />} variant="title">
              Roadmap
            </Text>
            <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
          </Column>
        </HoverCard>
        .
      </Text>
    </div>
  );
}

/** A hover card opened by a resting pointer, which it keeps open as the pointer moves onto it. */
export default function HoverAndFocus() {
  return (
    <Example>
      <MotionStage label="the card opening under a resting pointer">
        <Hovering />
      </MotionStage>
    </Example>
  );
}
