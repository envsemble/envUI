import { Box } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { Construction, setOut, sides, through, type Edges } from './reflow';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings = [2, 5] as const;

const parts = (drawing: HTMLElement) => {
  const box = drawing.firstElementChild!;
  return [box, box.firstElementChild!];
};

const draw = ([box, content]: Edges[]) => {
  const corners = (edges: Edges) =>
    [
      [edges.left, edges.top],
      [edges.right, edges.top],
      [edges.right, edges.bottom],
      [edges.left, edges.bottom],
    ] as const;
  const inner = corners(content!);
  return [
    ...setOut(box!),
    ...setOut(content!),
    ...corners(box!).map((corner, index) => through(corner, inner[index]!)),
    ...sides(box!),
    ...sides(content!),
  ];
};

/**
 * A box set out by construction lines: its edges, and within them its content's, with the lines
 * through their corners showing the inset between them, which grows and shrinks again.
 */
export default function BoxTile() {
  const step = useTimeline([1000, 1800]);
  return (
    <Construction parts={parts} draw={draw} step={step}>
      <Box
        padding={paddings[step]}
        style={{ boxSizing: 'border-box', inlineSize: '5.5rem', blockSize: '5.5rem' }}
      >
        <div style={{ blockSize: '100%' }} />
      </Box>
    </Construction>
  );
}
