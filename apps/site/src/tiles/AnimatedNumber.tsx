import { AnimatedNumber, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/* A count that grows, shrinks and grows back, rolling up or down each time. */
const counts = [1280, 1312, 1296, 1341];

/** A large count, which rolls to each new value. */
export default function AnimatedNumberTile() {
  const value = counts[useTimeline([900, 900, 900, 900])]!;
  return (
    <Text variant="display">
      <AnimatedNumber value={value} />
    </Text>
  );
}
