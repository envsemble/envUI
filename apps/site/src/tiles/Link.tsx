import { Column, Link, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-link', x: 0.3 },
  { wait: 540 },
  { press: true },
  { wait: 270 },
  { release: true },
  { wait: 360 },
  { leave: true },
  { wait: 480 },
];

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
