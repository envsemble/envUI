import { Grid, Surface, Text } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';

/** The columns, step by step: two, then four across. */
const columns = [2, 4];

/** The quarters, each a small card of its name. */
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * Four small outlined cards in a grid, a gap apart both ways, in two columns, then four across,
 * and two again. Each step lays the grid out at once, as a Grid does when its columns change.
 */
export default function GridTile() {
  const step = useTimeline([1100, 1800]);
  return (
    <Grid columns={`repeat(${columns[step]}, 2.25rem)`} gap={2}>
      {quarters.map((name) => (
        <Surface key={name} background="default" radius="sm" padding={2} style={outlined}>
          <Text variant="body-sm">{name}</Text>
        </Surface>
      ))}
    </Grid>
  );
}
