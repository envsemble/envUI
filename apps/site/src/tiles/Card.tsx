import type { CSSProperties } from 'react';
import { Card, Column, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-card', x: 0.6, y: 0.55 },
  { wait: 660 },
  { press: true },
  { wait: 360 },
  { release: true },
  { wait: 540 },
  { leave: true },
  { wait: 720 },
];

const outlined: CSSProperties = { '--env-card-outline': 'var(--env-color-border-muted)' };

export default function CardTile() {
  usePointer(script);
  return (
    <Card onClick={() => {}} padding={4} style={{ inlineSize: '9.5rem', ...outlined }}>
      <Column gap={1}>
        <Text variant="title">Northwind</Text>
        <Text variant="body-sm" emphasis="muted">
          Updated today
        </Text>
      </Column>
    </Card>
  );
}
