import { Button, Column, Surface, Text, type LayoutAlign, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';

/** Step by step: at the start, centred, at the end, spaced further apart, and back. */
const layouts: { align: LayoutAlign; gap: SpaceStep }[] = [
  { align: 'start', gap: 2 },
  { align: 'center', gap: 2 },
  { align: 'end', gap: 2 },
  { align: 'end', gap: 4 },
];

/**
 * A heading, a line and an action, one under another in an outlined surface, aligned in turn and
 * spaced further apart. Each step lays the column out at once, as a Column does when its props
 * change.
 */
export default function ColumnTile() {
  const { align, gap } = layouts[useTimeline([1000, 1300, 1300, 1300])]!;
  return (
    <Surface background="default" radius="sm" padding={3} style={outlined}>
      <Column align={align} gap={gap} style={{ inlineSize: '9rem' }}>
        <Text variant="title">Release notes</Text>
        <Text variant="body-sm" emphasis="muted">
          Three fixes this week.
        </Text>
        <Button variant="secondary" size="sm">
          Read
        </Button>
      </Column>
    </Surface>
  );
}
