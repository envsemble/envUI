import { Grid, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

/** A card's least width, in rem. */
const card = 2.25;

/** The width of `count` cards and the gaps between them, so the grid holds them exactly. */
const fit = (count: number) => `calc(${count * card}rem + ${count - 1} * var(--env-space-2))`;

/**
 * The panel's room, step by step: enough for two columns, then for four. In a phone's narrower
 * tile, where four across would overflow at the cards' own size, enough for three, with the fourth
 * card wrapping below.
 */
const widths = [fit(2), fit(4)];
const narrowWidths = [fit(2), fit(3)];

/** The quarters, each a small card with its name. */
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * Four small outlined cards in a grid of as many columns as fit, a gap apart both ways, in an
 * outlined panel whose width changes, so its edge shows the room the grid has: two columns, then
 * four across as the panel widens (three on a phone), and two again. Each step lays the grid out at
 * once, as a Grid does when its room changes.
 */
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
      <Grid columns={{ min: `${card}rem` }} gap={2}>
        {quarters.map((name) => (
          <Surface key={name} background="default" radius="sm" padding={2} style={outlined}>
            <Text variant="body-sm">{name}</Text>
          </Surface>
        ))}
      </Grid>
    </Surface>
  );
}
