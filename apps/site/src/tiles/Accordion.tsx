import { Accordion } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useMustShow, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const trigger = (index: number) => `.env-accordion-item:nth-child(${index}) .env-accordion-trigger`;

/** The second section opened, which closes the first; then the first opened again. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-accordion-content', x: 0.8, y: 0.3 },
  { wait: 150 },
  { to: trigger(2), x: 0.35, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: trigger(1), x: 0.35, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 700 },
];

/**
 * An accordion of two questions, the first open: short enough that the stage shows it whole with
 * either answer open; in a phone's lower tile a little smaller, so it shows whole there too.
 */
export default function AccordionTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  // The answer that opens shows whole, as the one that closes eases shut.
  useMustShow('.env-accordion-panel');
  return (
    <Accordion.Root defaultValue={['see']} style={{ inlineSize: narrow ? '11.25rem' : '12rem' }}>
      <Accordion.Item value="see" title="Who sees it?">
        Your team.
      </Accordion.Item>
      <Accordion.Item value="move" title="Can I move it?">
        Yes, any time.
      </Accordion.Item>
    </Accordion.Root>
  );
}
