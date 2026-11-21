import { Column, type LayoutAlign } from '@envsemble/envui';
import { edges, Item } from './LayoutDrawing';
import { useTimeline } from '../motion/Timeline';

const aligns: LayoutAlign[] = ['start', 'center', 'end'];

export default function ColumnTile() {
  const align = aligns[useTimeline([1200, 1200, 1200])];
  return (
    <div style={{ position: 'relative', padding: 'var(--env-space-3)' }}>
      {edges()}
      <Column align={align} gap={2} style={{ inlineSize: '9rem' }}>
        <Item width="6rem" height="0.875rem" />
        <Item width="8rem" height="0.625rem" />
        <Item width="3.5rem" height="1.5rem" radius="var(--env-radius-sm)" />
      </Column>
    </div>
  );
}
