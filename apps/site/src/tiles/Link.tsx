import { Column, Link, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Pressed, a fill behind it, held a while, as the press is what shows on a link already underlined;
 * let go, and left. Only the pointer acts: a focus ring arriving with no key to see would come
 * from nowhere.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-link', x: 0.3 },
  { wait: 500 },
  { press: true },
  { wait: 1700 },
  { release: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
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
