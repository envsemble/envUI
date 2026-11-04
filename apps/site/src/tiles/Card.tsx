import { Card, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Hovered, the card takes its hover fill; pressed, it settles a little; let go, and left. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-card', x: 0.62, y: 0.6 },
  { wait: 800 },
  { press: true },
  { wait: 300 },
  { release: true },
  { wait: 700 },
  { leave: true },
  { wait: 700 },
];

/** A card that opens a project: its name and a summary. */
export default function CardTile() {
  usePointer(script);
  return (
    <Card
      href="#northwind"
      onClick={(event) => event.preventDefault()}
      padding={4}
      style={{ inlineSize: '9rem' }}
    >
      <Text render={<span />} variant="title">
        Northwind
      </Text>
      <Text render={<span />} emphasis="muted">
        12 open tasks
      </Text>
    </Card>
  );
}
