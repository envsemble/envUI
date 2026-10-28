import { Link } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Hovered, pressed and let go: the link answers as it does under a pointer. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-link', x: 0.3 },
  { wait: 800 },
  { press: true },
  { wait: 220 },
  { release: true },
  { wait: 700 },
  { leave: true },
  { wait: 600 },
];

/** A link. Its click stays in the tile. */
export default function LinkTile() {
  usePointer(script);
  return (
    <Link href="/guide" onClick={(event) => event.preventDefault()}>
      Project guide
    </Link>
  );
}
