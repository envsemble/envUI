import { Column, Link, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

/**
 * On hover, its underline is drawn in full and its color gets a step deeper. Pressed, it gets a
 * fill behind it, briefly, as a click does. When the pointer releases and leaves, its underline
 * returns to its lighter rest. Only the pointer acts: a focus ring appearing with no visible key
 * press would come from nowhere.
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
