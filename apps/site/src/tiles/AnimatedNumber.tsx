import { AnimatedNumber, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

const counts = [1280, 1312, 1296, 1341];

export default function AnimatedNumberTile() {
  const value = counts[useTimeline([540, 540, 540, 540])];
  return (
    <Text variant="headline">
      <AnimatedNumber value={value} />
    </Text>
  );
}
