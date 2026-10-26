import type { CSSProperties } from 'react';
import { AvatarGroup } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const people = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
];

const steps = [700, 1400];

/*
 * A group of people's avatars, spread apart as a pointer on it spreads them, so they fill the room
 * the group keeps and sit centred in it; then gathered into its pile, and spread again. The
 * stylesheet spreads it by --env-avatar-group-spread, which the tile sets as a pointer would.
 */
export default function AvatarTile() {
  const step = useTimeline(steps);
  const style = { '--env-avatar-group-spread': step === 0 ? 1 : 0 } as CSSProperties;
  return <AvatarGroup people={people} size="lg" style={style} />;
}
