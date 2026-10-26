import { Row } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { bounds, Construction, diagonals, setOut, sides, type Edges } from './reflow';

/** The items' widths, in rem. */
const items = ['1.5rem', '2.25rem', '1.25rem'];

/** Step by step: the items together in the middle of the row, then spread along it. */
const spreads = ['center', 'between'] as const;

const parts = (drawing: HTMLElement) => [...drawing.firstElementChild!.children];

/** Each item's edges run across the tile, and the lines through the corners of all three. */
const draw = (edges: Edges[]) => [
  ...diagonals(bounds(edges)),
  ...edges.flatMap((part) => [...setOut(part), ...sides(part)]),
];

/**
 * A row of three items set out by construction lines, across the tile at their top and bottom
 * and down it at each one's sides, that spread along the row and gather again.
 */
export default function RowTile() {
  const step = useTimeline([1000, 1800]);
  return (
    <Construction parts={parts} draw={draw} step={step}>
      <Row gap={2} justify={spreads[step]} style={{ inlineSize: '9.5rem' }}>
        {items.map((width, index) => (
          <span key={index} style={{ flex: 'none', inlineSize: width, blockSize: '1.75rem' }} />
        ))}
      </Row>
    </Construction>
  );
}
