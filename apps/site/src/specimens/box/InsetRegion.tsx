import { Box, Button, Column, Text, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/** The inset steps up from 4 to 8, down to none and back, a beat at each. */
const insets: SpaceStep[] = [4, 8, 4, 0];
const steps = [1500, 1500, 1500, 1500];

/*
 * The overview's region (examples/box/InsetRegion.tsx), its edge dashed, as a Box never paints:
 * its inset changes, and the content moves in from the edge and out again. No one could change an
 * inset by hand, so a timeline steps it.
 */
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

/** The overview's Box, outlined, its inset stepping from none to step 8. */
export default function InsetRegionMotion() {
  return (
    <MotionStage label="the inset changing" height="18rem">
      <Insetting />
    </MotionStage>
  );
}
