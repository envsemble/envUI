import { Row } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { edges, gap, Item, Mark } from './Reflow';

/** The blocks' widths, in rem, at a height of 1.25: two squares between longer blocks. */
const items = [1.75, 1.25, 1.5, 1.25];

/** The width of the first `count` blocks and the gaps between them, so the row holds them exactly. */
const fit = (count: number) =>
  `calc(${items.slice(0, count).reduce((sum, width) => sum + width, 0)}rem + ${count - 1} * var(--env-space-2))`;

/**
 * The row's widths, step by step: all on one line, the last wrapped, all on one line again, two and
 * two.
 */
const widths = [fit(4), fit(3), fit(4), fit(2)];

/** The gap between the first two blocks, which stay where they are, marked in the padding above. */
const firstGap = gap('inline', {
  from: `calc(var(--env-space-2) + ${items[0]}rem)`,
  across: 'var(--env-space-2)',
  off: 'calc((var(--env-space-2) - var(--env-space-1)) / 2)',
});

/**
 * A row of four blocks in a frame, drawn in hairlines, the gap between them marked, that wraps as
 * it narrows, a block and then two, and widens again. Each width lays the row out at once, as a
 * Row does when the room it has changes.
 */
export default function RowTile() {
  const step = useTimeline([1000, 1400, 1300, 1600]);
  return (
    <div style={{ position: 'relative', padding: 'var(--env-space-2)', inlineSize: 'max-content' }}>
      {edges()}
      <Mark {...firstGap} />
      <Row wrap gap={2} style={{ position: 'relative', inlineSize: widths[step] }}>
        {items.map((width, index) => (
          <Item key={index} width={`${width}rem`} height="1.25rem" />
        ))}
      </Row>
    </div>
  );
}
