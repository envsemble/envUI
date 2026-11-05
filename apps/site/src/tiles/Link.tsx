import { Link, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Hovered, its underline drawn in full; pressed, a faint fill behind it; let go and left, then
 * reached with the keyboard, its focus ring round it.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-link', x: 0.3 },
  { wait: 1600 },
  { press: true },
  { wait: 1700 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
  { focus: '.env-link' },
  { wait: 2600 },
  { blur: true },
  { wait: 700 },
];

/** A link in a line of text. Its click stays in the tile. */
export default function LinkTile() {
  usePointer(script);
  return (
    <Text>
      Read the{' '}
      <Link href="/guide" onClick={(event) => event.preventDefault()}>
        project guide
      </Link>
      .
    </Text>
  );
}
