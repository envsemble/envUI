import { Column, type LayoutAlign, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { along, edges, Item, line, Mark } from './Reflow';

/** The blocks' widths: a heading, two lines and an action, as a column often holds. */
const items = ['4.5rem', '6.5rem', '5rem', '2.75rem'];

/** Step by step: at the start, centred, at the end, spaced further apart, and back. */
const layouts: { align: LayoutAlign; gap: SpaceStep }[] = [
  { align: 'start', gap: 2 },
  { align: 'center', gap: 2 },
  { align: 'end', gap: 2 },
  { align: 'end', gap: 4 },
];

/** Where the blocks line up, as a fraction across the column. */
const lines: Partial<Record<LayoutAlign, number>> = { start: 0, center: 0.5, end: 1 };

/**
 * A column of four blocks of different widths in a frame, drawn in hairlines, aligned in turn and
 * spaced further apart, the line they align to drawn through them a little beyond. Each step lays
 * the column out at once, as a Column does when its props change.
 */
export default function ColumnTile() {
  const { align, gap } = layouts[useTimeline([1000, 1300, 1300, 1300])]!;
  return (
    <div style={{ position: 'relative', padding: 'var(--env-space-2)' }}>
      {edges()}
      <Column align={align} gap={gap} style={{ position: 'relative', inlineSize: '7.5rem' }}>
        <Mark
          at={{
            ...line('block', `${(lines[align] ?? 0) * 100}%`),
            top: 'calc(-1 * var(--env-space-1))',
            bottom: 'calc(-1 * var(--env-space-1))',
          }}
          lines={along.block}
        />
        {items.map((width, index) => (
          <Item key={index} width={width} height={index ? '0.75rem' : '1rem'} />
        ))}
      </Column>
    </div>
  );
}
