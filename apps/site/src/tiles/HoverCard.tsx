import { useRef, useState } from 'react';
import { Avatar, HoverCard, Link, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const trigger = '.env-link';

/*
 * Starts from the open card, as it rests. The pointer comes to the name and moves onto the card,
 * which stays open while the pointer is there. It moves off, well before the name's start and clear
 * of the card, and the card closes after its close delay. The pointer comes back to the name and
 * rests, and after the card's delay it opens again, where the loop began.
 */
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

/**
 * How long the pointer rests on the name before the card opens: brief, so it is never closed long.
 */
const delay = 350;

/**
 * A hover card, open below the name it describes, with an avatar of the default size, so it shows
 * whole at about its own size in a gallery's low tile. The pointer ends the loop resting on the
 * name, so the card stays open. When the tile stops it stays open too, rather than closing as the
 * pointer leaves or being drawn again, which would make it appear with motion again.
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
      delay={delay}
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
