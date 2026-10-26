import { useRef } from 'react';
import { Row } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, dimension, frame, useReflow } from './reflow';

/** The blocks' widths, in rem: four that fit across the widest frame. */
const items = [1.75, 1.25, 1.5, 1.25];

/** The width of the first `count` blocks and the gaps between them, so the row holds them exactly. */
const fit = (count: number) =>
  `calc(${items.slice(0, count).reduce((sum, width) => sum + width, 0)}rem + ${count - 1} * var(--env-space-2))`;

/**
 * The row's widths, step by step: all on one line, the last wrapped, all on one line again, two and
 * two. Each wrap and its undoing moves blocks clear of one another, never across.
 */
const widths = [fit(4), fit(3), fit(4), fit(2)];

/** The gap between the first two blocks, which stay where they are, marked in the padding above. */
const gap = dimension('inline', {
  from: `calc(var(--env-space-2) + ${items[0]}rem)`,
  across: 'var(--env-space-2)',
  off: 'calc((var(--env-space-2) - var(--env-space-1)) / 2)',
});

/**
 * A row of four blocks, drawn in outline, the gap between them marked, that wraps as it narrows, a
 * block and then two, and widens again, its outline easing to its new width and holding a block
 * until it has wrapped.
 */
export default function RowTile() {
  const step = useTimeline([1000, 1400, 1300, 1600]);
  const row = useRef<HTMLDivElement>(null);
  const outline = useRef<HTMLDivElement>(null);
  useReflow(row, step, { outline });
  return (
    <div ref={outline} style={{ ...frame, position: 'relative', padding: 'var(--env-space-2)' }}>
      <span style={gap} />
      <Row ref={row} wrap gap={2} style={{ position: 'relative', inlineSize: widths[step] }}>
        {items.map((width, index) => (
          <span key={index} style={block(`${width}rem`)} />
        ))}
      </Row>
    </div>
  );
}
