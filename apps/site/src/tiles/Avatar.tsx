import { AvatarGroup } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const people = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
  { id: 4, name: 'Dana Kim' },
];

/**
 * Hovered, the pile spreads its people apart; resting on the count, its tooltip names the people
 * it stands for; left, the tooltip closes and the pile gathers again, and rests gathered a while
 * before it plays again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-avatar-group > :first-child' },
  { wait: 700 },
  { to: '.env-avatar-group-overflow', duration: 450 },
  { wait: 2200 },
  { leave: true },
  { wait: 2400 },
];

/**
 * A pile of people's avatars, three of four shown and a count for the one more, whose tooltip names
 * them on one line, with room above it in the stage. Its view holds as it plays: the pile spreads
 * and its count's tooltip opens in place, rather than the view following the tooltip away from the
 * pile. Two to a row, a smaller pile, two of three shown, so the spread pile's count stays near the
 * middle and its tooltip shows whole in the narrow stage.
 */
export default function AvatarTile() {
  const narrow = useMedia(narrowGallery);
  useHeldView();
  usePointer(script);
  return (
    <AvatarGroup
      people={narrow ? people.slice(0, 3) : people}
      max={narrow ? 2 : 3}
      size={narrow ? 'sm' : 'md'}
    />
  );
}
