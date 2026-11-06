import { Row, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Motion';
import { outlined } from './Outline';
import { narrowGallery } from './Tiles';

/** The cards' names, each card as wide as the others; a phone's narrower tile holds three. */
const cards = ['Plan', 'Docs', 'Team', 'Ops'];
const narrowCards = ['Plan', 'Docs', 'Ops'];

/** A card's width, in rem. */
const card = 2.75;

/** The width of `count` cards and the gaps between them, so the row holds them exactly. */
const fit = (count: number) => `calc(${count * card}rem + ${count - 1} * var(--env-space-2))`;

/**
 * The row's widths, step by step: all on one line, the last wrapped, all on one line again, two and
 * two; of three, the last wrapped, all on one line, and the last wrapped again.
 */
const widths = [fit(4), fit(3), fit(4), fit(2)];
const narrowWidths = [fit(3), fit(2), fit(3), fit(2)];

/**
 * Four small outlined cards in a row, three on a phone, a gap apart, that wraps as it narrows, a
 * card and then two, and widens again. Each width lays the row out at once, as a Row does when the
 * room it has changes.
 */
export default function RowTile() {
  const step = useTimeline([1000, 1400, 1300, 1600]);
  const narrow = useMedia(narrowGallery);
  return (
    <Row wrap gap={2} style={{ inlineSize: (narrow ? narrowWidths : widths)[step] }}>
      {(narrow ? narrowCards : cards).map((name) => (
        <Surface
          key={name}
          background="default"
          radius="sm"
          padding={2}
          style={{ ...outlined, inlineSize: `${card}rem`, boxSizing: 'border-box' }}
        >
          <Text variant="body-sm">{name}</Text>
        </Surface>
      ))}
    </Row>
  );
}
