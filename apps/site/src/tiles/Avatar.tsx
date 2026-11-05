import { AvatarGroup } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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

/**
 * A pile of people's avatars, three of five shown and a count for the rest. Its view holds as it
 * plays: the pile spreads and its count's tooltip opens in place, rather than the view following the
 * tooltip away from the pile. Two to a row, a smaller pile of four, whose count names one person,
 * so the spread pile and its tooltip show whole in the narrow stage.
 */
export default function AvatarTile() {
  const narrow = useMedia(narrowGallery);
  useHeldView();
  usePointer(script);
  return (
    <AvatarGroup
      people={narrow ? people.slice(0, 4) : people}
      max={3}
      size={narrow ? 'sm' : 'md'}
    />
  );
}
