import { useRef } from 'react';
import { Row } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame, useSize, useReflow } from './reflow';

/** The blocks' widths, in rem: four that fit across the widest frame. */
const items = ['1.75rem', '1.25rem', '1.5rem', '1.25rem'];

/** The frame's widths, step by step: all on one line, the last wrapped, two and two, back. */
const widths = ['9rem', '7rem', '5rem', '7rem'];

/** A row of four blocks that wraps as its frame narrows, a block at a time, and widens again. */
export default function RowTile() {
  const step = useTimeline([1000, 1500, 1700, 1500]);
  const row = useRef<HTMLDivElement>(null);
  useReflow(row, step);
  // The frame is as tall as the row, and grows with it as a line wraps.
  const height = useSize(row)?.height;
  return (
    <div
      style={{
        ...frame,
        inlineSize: widths[step],
        blockSize: height === undefined ? undefined : `calc(${height}px + 1.125rem)`,
        padding: '0.5rem',
        transition: `inline-size 700ms ${easing}, block-size 450ms ${easing}`,
      }}
    >
      <Row ref={row} wrap gap={2}>
        {items.map((width, index) => (
          <span key={index} style={block(width)} />
        ))}
      </Row>
    </div>
  );
}
