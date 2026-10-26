import { Column } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { bounds, Construction, diagonals, setOut, sides, type Edges } from './reflow';

/** The items' widths, in rem: a heading, a line and a shorter one, as a column often holds. */
const items = ['4.5rem', '6.5rem', '3.5rem'];

/** Step by step: the items together in the middle of the column, then spread down it. */
const spreads = ['center', 'between'] as const;

const parts = (drawing: HTMLElement) => [...drawing.firstElementChild!.children];

/** Each item's edges run across the tile, and the lines through the corners of all three. */
const draw = (edges: Edges[]) => [
  ...diagonals(bounds(edges)),
  ...edges.flatMap((part) => [...setOut(part), ...sides(part)]),
];

/**
 * A column of three items set out by construction lines, down the tile at their sides and across
 * it at each one's top and bottom, that spread down the column and gather again.
 */
export default function ColumnTile() {
  const step = useTimeline([1000, 1800]);
  return (
    <Construction parts={parts} draw={draw} step={step}>
      <Column gap={2} justify={spreads[step]} style={{ blockSize: '6.5rem' }}>
        {items.map((width, index) => (
          <span key={index} style={{ flex: 'none', inlineSize: width, blockSize: '1rem' }} />
        ))}
      </Column>
    </Construction>
  );
}
