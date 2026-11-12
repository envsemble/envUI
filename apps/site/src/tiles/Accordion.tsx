import { Accordion } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const trigger = (index: number) => `.env-accordion-item:nth-child(${index}) .env-accordion-trigger`;

/** Opens the second question, which closes the first, then opens the first again, as it began. */
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

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 15, height: 11.25 };

/**
 * An accordion of two questions, the first open at rest. One answer is open in every state, so the
 * still is as tall as the accordion ever gets, the stage shows it whole, clear of the card's
 * bottom, and the view holds while either answer opens below its question (useHeldView). In a
 * phone's lower tile it is a little narrower.
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
