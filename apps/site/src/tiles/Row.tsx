import { Row, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Timeline';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

const cards = ['Plan', 'Docs', 'Team', 'Ops'];
const narrowCards = ['Plan', 'Docs', 'Ops'];

const cardWidthRem = 2.75;

const fit = (count: number) =>
  `calc(${count * cardWidthRem}rem + ${count - 1} * var(--env-space-2))`;

const widths = [fit(4), fit(3), fit(4), fit(2)];
const narrowWidths = [fit(3), fit(2), fit(3), fit(2)];

export default function RowTile() {
  const step = useTimeline([1080, 1200, 1080, 1200]);
  const narrow = useMedia(narrowGallery);
  return (
    <Surface
      background="muted"
      radius="sm"
      padding={2}
      style={{
        ...outlined,
        inlineSize: (narrow ? narrowWidths : widths)[step],
        boxSizing: 'content-box',
      }}
    >
      <Row wrap gap={2}>
        {(narrow ? narrowCards : cards).map((name) => (
          <Surface
            key={name}
            background="default"
            radius="sm"
            padding={2}
            style={{ ...outlined, inlineSize: `${cardWidthRem}rem`, boxSizing: 'border-box' }}
          >
            <Text variant="body-sm">{name}</Text>
          </Surface>
        ))}
      </Row>
    </Surface>
  );
}
