import { Accordion } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

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

/** An accordion of three questions, the first open. */
export default function AccordionTile() {
  usePointer(script);
  return (
    <Accordion.Root defaultValue={['see']} style={{ inlineSize: '12rem' }}>
      <Accordion.Item value="see" title="Who can see it?">
        Everyone in the team.
      </Accordion.Item>
      <Accordion.Item value="move" title="Can I move it?">
        Yes, from its menu.
      </Accordion.Item>
      <Accordion.Item value="export" title="Can I export it?">
        As Markdown or PDF.
      </Accordion.Item>
    </Accordion.Root>
  );
}
