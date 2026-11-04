import { Column, Rating, Text } from '@envsemble/envui';
import { Example } from '../../figures/Example';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/* The value steps up and past the end; the stars and the number snap to half steps, and stop at 5. */
const values = [4.3, 4.6, 4.8, 5.4];
const steps = [1500, 1500, 1500, 1700];

function Rounding() {
  const step = useTimeline(steps);
  const value = values[step]!;
  return (
    <Column gap={2} align="center">
      <Rating value={value} showValue />
      <Text variant="body-sm" emphasis="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Value {value}
      </Text>
    </Column>
  );
}

/** A rating given 4.3, 4.6, 4.8 and 5.4, shown to the nearest half star within the scale. */
export default function RoundingMotion() {
  return (
    <Example>
      <MotionStage label="the value rounding to half stars">
        <Rounding />
      </MotionStage>
    </Example>
  );
}
