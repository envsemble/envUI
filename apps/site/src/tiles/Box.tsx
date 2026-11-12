import { Box, Button, Column, Surface, Text, type SpaceStep } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

/**
 * Steps through the inset: a large one, a small one, and back. A phone's lower stage holds less, so
 * the whole surface, its action included, shows at the larger inset.
 */
const paddings: SpaceStep[] = [5, 1];
const narrowPaddings: SpaceStep[] = [3, 1];

/**
 * An invitation inset by a Box in an outlined surface as wide as its content, as a region holds it:
 * a heading, a line and an action, with the space between them and the surface's edge growing and
 * shrinking. Each step lays the box out at once, as a Box does when its padding changes.
 */
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
