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

const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-avatar-group > :first-child' },
  { wait: 420 },
  { to: '.env-avatar-group-overflow', duration: 450 },
  { wait: 1320 },
  { leave: true },
  { wait: 1440 },
];

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
