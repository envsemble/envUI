import { Accordion } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const trigger = (index: number) => `.env-accordion-item:nth-child(${index}) .env-accordion-trigger`;

/** The second question opened, which closes the first; and the first opened again, as it began. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger(2), x: 0.35 },
  { wait: 300 },
  { click: true },
  { wait: 1400 },
  { to: trigger(1), x: 0.35, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
];

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 15, height: 11.25 };

/**
 * An accordion of two questions, the first open at rest: one answer is open in every state, so the
 * still is as tall as the accordion gets and the stage shows it whole, clear of the card's foot,
 * and the view holds as either answer opens below its question (useHeldView); in a phone's lower
 * tile a little narrower.
 */
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
