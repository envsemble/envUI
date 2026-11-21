import { Grid } from '@envsemble/envui';
import { edges } from './LayoutDrawing';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { narrowGallery } from './Tiles';

const cardLeastWidthRem = 2.25;

const fit = (count: number) =>
  `calc(${count * cardLeastWidthRem}rem + ${count - 1} * var(--env-space-2))`;

const widths = [fit(2), fit(4)];
const narrowWidths = [fit(2), fit(3)];

const cells = [1, 2, 3, 4];

export default function GridTile() {
  const step = useTimeline([1320, 1320]);
  const narrow = useMedia(narrowGallery);
  return (
    <div
      style={{
        position: 'relative',
        padding: 'var(--env-space-2)',
        inlineSize: (narrow ? narrowWidths : widths)[step],
        boxSizing: 'content-box',
      }}
    >
      {edges()}
      <Grid columns={{ min: `${cardLeastWidthRem}rem` }} gap={2}>
        {cells.map((cell) => (
          <span key={cell} style={{ position: 'relative', blockSize: '2rem' }}>
            {edges('var(--env-radius-sm)')}
          </span>
        ))}
      </Grid>
    </div>
  );
}
