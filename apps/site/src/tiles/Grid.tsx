import { Column, Grid } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { bounds, Construction, diagonals, setOut, sides, type Edges } from './reflow';

/** The columns, step by step: two, then three across. */
const columns = [2, 3];

/** The rows the cells fill, column by column. */
const rows = 3;

const parts = (drawing: HTMLElement) => [...drawing.firstElementChild!.firstElementChild!.children];

/** Each cell's edges run across the tile, and the lines through the grid's corners. */
const draw = (edges: Edges[]) => [
  ...diagonals(bounds(edges)),
  ...edges.flatMap((part) => [...setOut(part), ...sides(part)]),
];

/**
 * The cells of a grid set out by construction lines, across and down the tile at their edges,
 * crossing to form them: two columns of three, and a third column splitting off the second, the
 * grid widening around it, and closing again.
 */
export default function GridTile() {
  const step = useTimeline([1000, 1800]);
  const count = columns[step]!;
  return (
    <Construction parts={parts} draw={draw} step={step}>
      <Column align="center" justify="center" style={{ inlineSize: '7rem', blockSize: '5.5rem' }}>
        <Grid
          columns={`repeat(${count}, 1.75rem)`}
          gap={2}
          style={{ gridTemplateRows: `repeat(${rows}, 1.25rem)` }}
        >
          {/* Every cell in the third column, which lies on the second until it opens. */}
          {Array.from({ length: 3 * rows }, (_, index) => (
            <span
              key={index}
              style={{
                gridColumn: Math.min(Math.floor(index / rows) + 1, count),
                gridRow: (index % rows) + 1,
              }}
            />
          ))}
        </Grid>
      </Column>
    </Construction>
  );
}
