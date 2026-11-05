import { AvatarGroup } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const people = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
  { id: 4, name: 'Dana Kim' },
  { id: 5, name: 'Leo Park' },
];

/**
 * Hovered, the pile spreads its people apart; resting on the count, its tooltip names the people
 * it stands for; left, the pile gathers again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-avatar-group > :first-child' },
  { wait: 700 },
  { to: '.env-avatar-group-overflow', duration: 450 },
  { wait: 2600 },
  { leave: true },
  { wait: 900 },
];

/** A pile of people's avatars, three of five shown and a count for the rest. */
export default function AvatarTile() {
  usePointer(script);
  return <AvatarGroup people={people} max={3} size="md" />;
}
