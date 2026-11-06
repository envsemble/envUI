import { Box, Button, Column, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings: SpaceStep[] = [2, 5];

/**
 * An invitation inset by a Box in an outlined surface as wide as its content, as a region holds
 * it: a heading, a line and an action, the space between them and the surface's edge growing and
 * shrinking again. Each step lays the box out at once, as a Box does when its padding changes.
 */
export default function BoxTile() {
  const step = useTimeline([1100, 1800]);
  return (
    <Surface
      background="default"
      radius="sm"
      padding={0}
      style={{ ...outlined, inlineSize: 'max-content' }}
    >
      <Box padding={paddings[step]}>
        <Column gap={1} align="start">
          <Text variant="body">Invite your team</Text>
          <Text variant="body-sm" emphasis="muted">
            Plans go faster.
          </Text>
          <Button variant="secondary" size="sm">
            Invite
          </Button>
        </Column>
      </Box>
    </Surface>
  );
}
