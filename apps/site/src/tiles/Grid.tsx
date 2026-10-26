import { useRef } from 'react';
import { Grid } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame, useReflow, useSize } from './reflow';

/** The columns, step by step: two, then four across. */
const columns = [2, 4];

/**
 * Four blocks in two equal columns, then four across, the blocks gliding to their new cells and
 * the frame easing to the grid's new size, and two again.
 */
export default function GridTile() {
  const step = useTimeline([1100, 1800]);
  const grid = useRef<HTMLDivElement>(null);
  useReflow(grid, step, { speed: 11 });
  const size = useSize(grid);
  return (
    <div
      style={{
        ...frame,
        display: 'grid',
        placeItems: 'center',
        inlineSize: size && `calc(${size.width}px + 1.125rem)`,
        blockSize: size && `calc(${size.height}px + 1.125rem)`,
        padding: '0.5rem',
        transition: `inline-size 450ms ${easing}, block-size 450ms ${easing}`,
      }}
    >
      <Grid ref={grid} columns={`repeat(${columns[step]}, 1.75rem)`} gap={2}>
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} style={block('auto', '1.75rem')} />
        ))}
      </Grid>
    </div>
  );
}
