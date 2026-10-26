import { useRef } from 'react';
import { Column, type LayoutAlign, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame, useReflow } from './reflow';

/** The blocks' widths: a heading, two lines and an action, as a column often holds. */
const items = ['4.5rem', '6.5rem', '5rem', '2.75rem'];

/** Step by step: at the start, centred, at the end, spaced further apart, and back. */
const layouts: { align: LayoutAlign; gap: SpaceStep }[] = [
  { align: 'start', gap: 2 },
  { align: 'center', gap: 2 },
  { align: 'end', gap: 2 },
  { align: 'end', gap: 4 },
];

/** A column of four blocks of different widths, aligned in turn and spaced further apart. */
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
        inlineSize: '8.5rem',
        padding: '0.5rem',
        transition: `gap 600ms ${easing}`,
      }}
    >
      {items.map((width, index) => (
        <span key={index} style={block(width, index ? '0.75rem' : '1rem')} />
      ))}
    </Column>
  );
}
