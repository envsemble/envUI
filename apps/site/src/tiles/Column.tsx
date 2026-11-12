import { Button, Column, Surface, Text, type LayoutAlign } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';

/** Steps through the alignments: start, centre, end, and back. */
const aligns: LayoutAlign[] = ['start', 'center', 'end'];

/**
 * A heading, a line and an action, one under another in an outlined surface, aligned in turn. Each
 * step lays the column out at once, as a Column does when its props change.
 */
export default function ColumnTile() {
  const align = aligns[useTimeline([1200, 1200, 1200])];
  return (
    <Surface background="default" radius="sm" padding={3} style={outlined}>
      <Column align={align} gap={2} style={{ inlineSize: '9rem' }}>
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
