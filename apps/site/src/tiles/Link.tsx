import { Column, Link, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Hovered a moment, its underline drawn in full; pressed, a faint fill behind it; let go and left,
 * then reached with the keyboard, its focus ring round it, which holds longest, as it reads best.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-link', x: 0.3 },
  { wait: 700 },
  { press: true },
  { wait: 1300 },
  { release: true },
  { wait: 200 },
  { leave: true },
  { wait: 200 },
  { focus: '.env-link' },
  { wait: 3000 },
  { blur: true },
  { wait: 500 },
];

/**
 * A link on a line of its own under a line of text, a step apart, so its focus ring has room round
 * it rather than over the words beside it. Its click stays in the tile.
 */
export default function LinkTile() {
  usePointer(script);
  return (
    <Column gap={2}>
      <Text>Setup takes five minutes.</Text>
      <Text>
        <Link href="/guide" onClick={(event) => event.preventDefault()}>
          Read the project guide
        </Link>
      </Text>
    </Column>
  );
}
