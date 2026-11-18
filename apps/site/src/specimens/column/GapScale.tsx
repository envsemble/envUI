import type { CSSProperties } from 'react';
import { Column, Row, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

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

const fillApartFromStage: CSSProperties = {
  '--_surface-container-default': 'light-dark(var(--env-color-bg-page), var(--env-color-bg-muted))',
};

const order: SpaceStep[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2];
const steps = order.map((step) => (step === 1 || step === 9 ? 780 : 420));

const twoBlocksAtLargestGapHeight = 'calc(2 * 2.75rem + 4rem)';

function Stepping() {
  const step = order[useTimeline(steps)];
  return (
    <Row gap={6} align="start" style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Column gap={1} style={{ inlineSize: '5rem' }}>
        <Text variant="title">Step {step}</Text>
        <Text variant="caption" emphasis="muted">
          {sizes[step]}
        </Text>
      </Column>
      <Column gap={step} style={{ flex: 1, minBlockSize: twoBlocksAtLargestGapHeight }}>
        <Surface radius="sm" padding={2} style={fillApartFromStage}>
          <Text>First</Text>
        </Surface>
        <Surface radius="sm" padding={2} style={fillApartFromStage}>
          <Text>Second</Text>
        </Surface>
      </Column>
    </Row>
  );
}

export default function GapScale() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the gap stepping through the scale">
        <Stepping />
      </MotionStage>
    </SpecimenFrame>
  );
}
