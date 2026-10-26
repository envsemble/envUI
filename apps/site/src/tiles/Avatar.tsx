import { AvatarGroup } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

const people = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
];

/** Hovered, the pile spreads its people apart; left, it gathers again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-avatar-group > :first-child' },
  { wait: 1600 },
  { leave: true },
  { wait: 900 },
];

/** A pile of people's avatars. */
export default function AvatarTile() {
  usePointer(script);
  return <AvatarGroup people={people} size="lg" />;
}
