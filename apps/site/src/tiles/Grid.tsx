import { Grid } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { edges, gap, Item, Mark } from './Reflow';

/** The columns, step by step: two, then four across. */
const columns = [2, 4];

/** A cell's side. */
const cell = '1.75rem';

/** Where the first gap begins on either axis, past the padding and the first cell. */
const firstGap = `calc(var(--env-space-2) + ${cell})`;

/** Where a mark stands in the padding, centred in it. */
const inPadding = 'calc((var(--env-space-2) - var(--env-space-1)) / 2)';

/** The gap between the first two columns, marked above, and between the two rows, to the left. */
const columnGap = gap('inline', { from: firstGap, across: 'var(--env-space-2)', off: inPadding });
const rowGap = gap('block', { from: firstGap, across: 'var(--env-space-2)', off: inPadding });

/**
 * Four square cells in a frame, drawn in hairlines, in two columns, the gaps between them marked,
 * then four across, and two again. Each step lays the grid out at once, as a Grid does when its
 * columns change; the rows' gap is marked while there are two rows.
 */
export default function GridTile() {
  const step = useTimeline([1100, 1800]);
  return (
    <div style={{ position: 'relative', padding: 'var(--env-space-2)', inlineSize: 'max-content' }}>
      {edges()}
      <Mark {...columnGap} />
      {step === 0 && <Mark {...rowGap} />}
      <Grid
        columns={`repeat(${columns[step]}, ${cell})`}
        gap={2}
        style={{ position: 'relative', inlineSize: 'max-content' }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Item key={index} width={cell} height={cell} />
        ))}
      </Grid>
    </div>
  );
}
