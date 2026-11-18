import { Box, Button, Column, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

const paddings: SpaceStep[] = [5, 1];
const narrowPaddings: SpaceStep[] = [3, 1];

export default function BoxTile() {
  const step = useTimeline([1320, 1320]);
  const narrow = useMedia(narrowGallery);
  return (
    <Surface
      background="default"
      radius="sm"
      padding={0}
      style={{ ...outlined, inlineSize: 'max-content' }}
    >
      <Box padding={(narrow ? narrowPaddings : paddings)[step]}>
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
