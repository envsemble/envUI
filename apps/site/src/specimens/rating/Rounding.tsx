import { Column, Rating, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const values = [4.3, 4.6, 4.8, 5.4];
const steps = [900, 900, 900, 1020];

function Rounding() {
  const step = useTimeline(steps);
  const value = values[step];
  return (
    <Column gap={2} align="center">
      <Rating value={value} showValue />
      <Text variant="body-sm" emphasis="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Value {value}
      </Text>
    </Column>
  );
}

export default function RoundingMotion() {
  return (
    <SpecimenFrame>
      <MotionStage label="the value rounding to half stars">
        <Rounding />
      </MotionStage>
    </SpecimenFrame>
  );
}
