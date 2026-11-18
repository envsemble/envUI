import { Accordion } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const trigger = (index: number) => `.env-accordion-item:nth-child(${index}) .env-accordion-trigger`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: trigger(2), x: 0.35 },
  { wait: 180 },
  { click: true },
  { wait: 840 },
  { to: trigger(1), x: 0.35, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 360 },
];

export const tileWindow: TileWindow = { width: 15, height: 11.25 };

export default function AccordionTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  useHeldView();
  return (
    <Accordion.Root defaultValue={['see']} style={{ inlineSize: narrow ? '9.5rem' : '12rem' }}>
      <Accordion.Item value="see" title="Who sees it?">
        Your team.
      </Accordion.Item>
      <Accordion.Item value="move" title="Can I move it?">
        Yes, any time.
      </Accordion.Item>
    </Accordion.Root>
  );
}
