import { useRef } from 'react';
import { Column, type LayoutAlign, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { across, alignment, block, easing, frame, useReflow } from './reflow';

/** The blocks' widths: a heading, two lines and an action, as a column often holds. */
const items = ['4.5rem', '6.5rem', '5rem', '2.75rem'];

/** Step by step: at the start, centred, at the end, spaced further apart, and back. */
const layouts: { align: LayoutAlign; gap: SpaceStep }[] = [
  { align: 'start', gap: 2 },
  { align: 'center', gap: 2 },
  { align: 'end', gap: 2 },
  { align: 'end', gap: 4 },
];

/** Where the blocks line up, as a fraction across the column's content. */
const lines: Partial<Record<LayoutAlign, number>> = { start: 0, center: 0.5, end: 1 };

/**
 * A column of four blocks of different widths, aligned in turn and spaced further apart, the line
 * they align to drawn behind them and gliding with them.
 */
export default function ColumnTile() {
  const step = useTimeline([1000, 1300, 1300, 1300]);
  const column = useRef<HTMLDivElement>(null);
  useReflow(column, step);
  const { align, gap } = layouts[step]!;
  return (
    <Column
      ref={column}
      align={align}
      gap={gap}
      style={{
        ...frame,
        position: 'relative',
        isolation: 'isolate',
        inlineSize: '8.5rem',
        padding: 'var(--env-space-2)',
        transition: `gap 600ms ${easing}`,
      }}
    >
      <span style={alignment(across(lines[align] ?? 0, 'var(--env-space-2)'))} />
      {items.map((width, index) => (
        <span key={index} style={block(width, index ? '0.75rem' : '1rem')} />
      ))}
    </Column>
  );
}
