import { Column, Link, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Hovered, its underline drawn in full and its color a step deeper; pressed, a fill behind it,
 * briefly, as a click is; let go, and left, its underline back to its lighter rest. Only the
 * pointer acts: a focus ring arriving with no key to see would come from nowhere.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-link', x: 0.3 },
  { wait: 900 },
  { press: true },
  { wait: 450 },
  { release: true },
  { wait: 600 },
  { leave: true },
  { wait: 800 },
];

/** A link on a line of its own under a line of text, a step apart. Its click stays in the tile. */
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
