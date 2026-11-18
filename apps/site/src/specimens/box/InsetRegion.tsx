import { Box, Button, Column, Text, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';

const insets: SpaceStep[] = [4, 8, 4, 0];
const steps = [900, 900, 900, 900];

function Insetting() {
  const step = useTimeline(steps);
  return (
    <Box name="invitation" padding={insets[step]} className="catalogue-inset-box">
      <Column gap={3} align="start">
        <Text render={<p />} variant="title">
          Invite your team
        </Text>
        <Text>Projects are easier with the people who work on them.</Text>
        <Button variant="secondary">Invite people</Button>
      </Column>
    </Box>
  );
}

export default function InsetRegionMotion() {
  return (
    <MotionStage label="the inset changing" height="18rem">
      <Insetting />
    </MotionStage>
  );
}
