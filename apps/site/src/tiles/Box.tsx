import { Box, Column, type SpaceStep } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { edges, Item } from './LayoutDrawing';
import { narrowGallery } from './Tiles';

const paddings: SpaceStep[] = [5, 1];
const narrowPaddings: SpaceStep[] = [3, 1];

export default function BoxTile() {
  const step = useTimeline([1320, 1320]);
  const narrow = useMedia(narrowGallery);
  return (
    <Box
      padding={(narrow ? narrowPaddings : paddings)[step]}
      style={{ position: 'relative', inlineSize: 'max-content' }}
    >
      {edges()}
      <Column gap={2} align="start">
        <Item width="7rem" height="0.875rem" />
        <Item width="5rem" height="0.625rem" />
        <Item width="3.5rem" height="1.5rem" radius="var(--env-radius-sm)" />
      </Column>
    </Box>
  );
}
