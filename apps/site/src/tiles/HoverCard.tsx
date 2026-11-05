import { useRef, useState } from 'react';
import { Avatar, HoverCard, Link, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const trigger = '.env-link';

/*
 * The pointer, resting on the name, moves off it, and the card closes; it comes back and rests,
 * and after the card's delay it opens again, where the loop began.
 */
const script: PointerStep[] = [
  { cue: 'live' },
  { to: trigger, x: 0.6, y: 0.6 },
  { wait: 800 },
  { to: trigger, x: 1.5, y: -0.6, duration: 450 },
  { wait: 1100 },
  { to: trigger, x: 0.6, y: 0.6, duration: 450 },
  { wait: 1700 },
];

/**
 * A hover card, open below the name it tells about, its avatar of the default size, so it shows
 * whole at about its own size in a gallery's low tile. The pointer ends the loop resting on the name,
 * so it stays open; stopped, it stays open too, rather than closing as the pointer goes or being
 * drawn anew, which would bring it in again.
 */
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
