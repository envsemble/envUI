import { useRef } from 'react';
import { Grid } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, frame, useReflow } from './reflow';

/** The columns, step by step: two, then four across. */
const columns = [2, 4];

/**
 * Four blocks, drawn in outline, in two equal columns, then four across, the blocks gliding to
 * their new cells and the outline easing around them, and two again.
 */
export default function GridTile() {
  const step = useTimeline([1100, 1800]);
  const grid = useRef<HTMLDivElement>(null);
  const outline = useRef<HTMLDivElement>(null);
  useReflow(grid, step, { speed: 11, outline });
  return (
    <div ref={outline} style={{ ...frame, padding: '0.5rem' }}>
      <Grid
        ref={grid}
        columns={`repeat(${columns[step]}, 1.75rem)`}
        gap={2}
        style={{ position: 'relative', inlineSize: 'max-content' }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} style={block('auto', '1.75rem')} />
        ))}
      </Grid>
    </div>
  );
}
