import { useRef } from 'react';
import { Grid } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, dimension, easing, frame, useReflow } from './reflow';

/** The columns, step by step: two, then four across. */
const columns = [2, 4];

/** A cell's side. */
const cell = '1.75rem';

/** Where a mark stands in the padding, centred in it. */
const inPadding = 'calc((var(--env-space-2) - var(--env-space-1)) / 2)';

/** Where the first gap begins, past the padding and the first cell. */
const firstGap = `calc(var(--env-space-2) + ${cell})`;

/** The gap between the first two columns, marked above, and between the two rows, to the left. */
const columnGap = dimension('inline', {
  from: firstGap,
  across: 'var(--env-space-2)',
  off: inPadding,
});
const rowGap = dimension('block', { from: firstGap, across: 'var(--env-space-2)', off: inPadding });

/**
 * Four blocks, drawn in outline, in two equal columns, the gaps between them marked, then four
 * across, the blocks gliding to their new cells and the outline easing around them, and two again.
 * The rows' gap fades as the rows become one and returns once the blocks are back in two.
 */
export default function GridTile() {
  const step = useTimeline([1100, 1800]);
  const grid = useRef<HTMLDivElement>(null);
  const outline = useRef<HTMLDivElement>(null);
  useReflow(grid, step, { speed: 11, outline });
  const rows = step === 0;
  return (
    <div ref={outline} style={{ ...frame, position: 'relative', padding: 'var(--env-space-2)' }}>
      <span style={columnGap} />
      <span
        style={{
          ...rowGap,
          opacity: rows ? 1 : 0,
          transition: rows ? `opacity 300ms ${easing} 500ms` : `opacity 150ms ${easing}`,
        }}
      />
      <Grid
        ref={grid}
        columns={`repeat(${columns[step]}, ${cell})`}
        gap={2}
        style={{ position: 'relative', inlineSize: 'max-content' }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} style={block('auto', cell)} />
        ))}
      </Grid>
    </div>
  );
}
