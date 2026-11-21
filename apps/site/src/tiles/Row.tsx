import { Row } from '@envsemble/envui';
import { edges, Item } from './LayoutDrawing';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { narrowGallery } from './Tiles';

const cards = [1, 2, 3, 4];
const narrowCards = [1, 2, 3];

const cardWidthRem = 2.75;

const fit = (count: number) =>
  `calc(${count * cardWidthRem}rem + ${count - 1} * var(--env-space-2))`;

const widths = [fit(4), fit(3), fit(4), fit(2)];
const narrowWidths = [fit(3), fit(2), fit(3), fit(2)];

export default function RowTile() {
  const step = useTimeline([1080, 1200, 1080, 1200]);
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
      <Row wrap gap={2}>
        {(narrow ? narrowCards : cards).map((card) => (
          <Item
            key={card}
            width={`${cardWidthRem}rem`}
            height="2rem"
            radius="var(--env-radius-sm)"
          />
        ))}
      </Row>
    </div>
  );
}
