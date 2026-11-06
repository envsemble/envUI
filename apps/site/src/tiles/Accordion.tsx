import { Accordion } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const trigger = (index: number) => `.env-accordion-item:nth-child(${index}) .env-accordion-trigger`;

/**
 * The first question opened; the second opened, which closes the first; and the second closed
 * again, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger(1), x: 0.35 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: trigger(2), x: 0.35, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 600 },
];

/**
 * An accordion of two questions, both closed at rest, laid out from the stage's top, so the
 * questions stay where they are as either answer opens below its own, and the stage shows both
 * with either answer open (useHeldView); in a phone's lower tile a little narrower.
 */
export default function AccordionTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  useHeldView(true);
  return (
    <Accordion.Root style={{ inlineSize: narrow ? '9.5rem' : '12rem' }}>
      <Accordion.Item value="see" title="Who sees it?">
        Your team.
      </Accordion.Item>
      <Accordion.Item value="move" title="Can I move it?">
        Yes, any time.
      </Accordion.Item>
    </Accordion.Root>
  );
}
