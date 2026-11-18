import { Button, Column, Surface, Text, type LayoutAlign } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';

const aligns: LayoutAlign[] = ['start', 'center', 'end'];

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
