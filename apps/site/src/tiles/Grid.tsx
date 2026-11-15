import { Grid, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

const cardLeastWidthRem = 2.25;

const fit = (count: number) =>
  `calc(${count * cardLeastWidthRem}rem + ${count - 1} * var(--env-space-2))`;

const widths = [fit(2), fit(4)];
const narrowWidths = [fit(2), fit(3)];

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function GridTile() {
  const step = useTimeline([1320, 1320]);
  const narrow = useMedia(narrowGallery);
  return (
    <Surface
      background="muted"
      radius="sm"
      padding={2}
      style={{
        ...outlined,
        inlineSize: (narrow ? narrowWidths : widths)[step],
        boxSizing: 'content-box',
      }}
    >
      <Grid columns={{ min: `${cardLeastWidthRem}rem` }} gap={2}>
        {quarters.map((name) => (
          <Surface key={name} background="default" radius="sm" padding={2} style={outlined}>
            <Text variant="body-sm">{name}</Text>
          </Surface>
        ))}
      </Grid>
    </Surface>
  );
}
