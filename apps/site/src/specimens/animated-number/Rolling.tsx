import { AnimatedNumber, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const steps = [960, 960, 960];
const values = [1280, 1312, 1350];

function Counting() {
  const step = useTimeline(steps);
  return (
    <Text variant="display" render={<span />}>
      <AnimatedNumber value={values[step]} /> tasks
    </Text>
  );
}

export default function Rolling() {
  return (
    <SpecimenFrame>
      <MotionStage label="the number rolling to its new values">
        <Counting />
      </MotionStage>
    </SpecimenFrame>
  );
}
