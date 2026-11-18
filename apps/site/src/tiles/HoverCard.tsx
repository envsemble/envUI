import { useRef, useState } from 'react';
import { Avatar, HoverCard, Link, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const trigger = '.env-link';

const script: PointerStep[] = [
  { cue: 'live' },
  { to: trigger, x: 0.6, y: 0.6 },
  { wait: 360 },
  { to: '.env-hover-card strong', x: 0.5, y: 0.6, duration: 450 },
  { wait: 540 },
  { to: trigger, x: -0.75, y: 0.4, duration: 400 },
  { wait: 600 },
  { to: trigger, x: 0.6, y: 0.6, duration: 450 },
  { wait: 1320 },
];

const openDelayMs = 350;

export default function HoverCardTile() {
  const [open, setOpen] = useState(true);
  const live = useRef(false);
  usePointer(script, {
    onCue: () => {
      live.current = true;
    },
    onRest: () => {
      live.current = false;
      setOpen(true);
    },
  });
  return (
    <HoverCard
      open={open}
      delay={openDelayMs}
      onOpenChange={(next) => {
        if (live.current) setOpen(next);
      }}
      trigger={
        <Link href="/people/priya-shah" onClick={(event) => event.preventDefault()}>
          Priya Shah
        </Link>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Avatar name="Priya Shah" />
        <div>
          <Text render={<strong />} variant="title">
            Priya Shah
          </Text>
          <Text variant="body-sm" emphasis="muted">
            Research lead
          </Text>
        </div>
      </div>
    </HoverCard>
  );
}
