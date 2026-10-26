import { Column, Row, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { useTimeline } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const sizes: Record<SpaceStep, string> = {
  0: '0',
  1: '0.25 rem',
  2: '0.5 rem',
  3: '0.75 rem',
  4: '1 rem',
  5: '1.5 rem',
  6: '2 rem',
  7: '2.5 rem',
  8: '3 rem',
  9: '4 rem',
};

/** Up the scale a step at a time, from 1 to 9, and back down to 1. */
const order: SpaceStep[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2];
const steps = order.map((step) => (step === 1 || step === 9 ? 1300 : 700));

function Stepping() {
  const step = order[useTimeline(steps)]!;
  return (
    <Row gap={6} align="start" style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Column gap={1} style={{ inlineSize: '5rem' }}>
        <Text variant="title">Step {step}</Text>
        <Text variant="caption" emphasis="muted">
          {sizes[step]}
        </Text>
      </Column>
      {/* As tall as the largest gap holds from the start, the first block at its top, so only the
          second moves. */}
      <Column
        gap={step}
        style={{
          flex: 1,
          minBlockSize: 'calc(2 * 2.75rem + 4rem)',
          transition: 'gap var(--env-motion-duration-slow) var(--env-motion-ease)',
        }}
      >
        <Surface background="muted" radius="sm" padding={2}>
          <Text>First</Text>
        </Surface>
        <Surface background="muted" radius="sm" padding={2}>
          <Text>Second</Text>
        </Surface>
      </Column>
    </Row>
  );
}

/** One column whose gap steps up the spacing scale and back down. */
export default function GapScale() {
  return (
    <Example size="content">
      <MotionStage label="the gap stepping through the scale">
        <Stepping />
      </MotionStage>
    </Example>
  );
}
