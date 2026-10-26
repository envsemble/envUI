import { useRef } from 'react';
import { Row } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, frame, useReflow } from './reflow';

/** The blocks' widths, in rem: four that fit across the widest frame. */
const items = ['1.75rem', '1.25rem', '1.5rem', '1.25rem'];

/**
 * The row's widths, step by step: all on one line, the last wrapped, all on one line again, two and
 * two. Each wrap and its undoing moves blocks clear of one another, never across.
 */
const widths = ['8rem', '6rem', '8rem', '4rem'];

/**
 * A row of four blocks, drawn in outline, that wraps as it narrows, a block and then two, and
 * widens again, its outline easing to its new width and holding a block until it has wrapped.
 */
export default function RowTile() {
  const step = useTimeline([1000, 1400, 1300, 1600]);
  const row = useRef<HTMLDivElement>(null);
  const outline = useRef<HTMLDivElement>(null);
  useReflow(row, step, { outline });
  return (
    <div ref={outline} style={{ ...frame, padding: '0.5rem' }}>
      <Row ref={row} wrap gap={2} style={{ position: 'relative', inlineSize: widths[step] }}>
        {items.map((width, index) => (
          <span key={index} style={block(width)} />
        ))}
      </Row>
    </div>
  );
}
