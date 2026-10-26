import { RichTextEditor } from '@envsemble/envui/rich-text';
import { usePointer, type PointerStep } from '../previews/Motion';

const task = (index: number) =>
  `li:nth-child(${index} of li:has(.env-rich-text-task)) .env-checkbox-input`;

const notes = '**Launch**\n\n- [ ] Book the venue\n- [ ] Send the press kit';

/** The tasks of a checklist ticked off, one and then the other, and cleared again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: task(1) },
  { wait: 400 },
  { click: true },
  { wait: 700 },
  { to: task(2), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { to: task(1), duration: 400 },
  { click: true },
  { wait: 200 },
  { to: task(2), duration: 350 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

/** A rich text editor: its formatting toolbar over a short checklist. */
export default function RichTextTile() {
  usePointer(script);
  return (
    <RichTextEditor
      aria-label="Launch notes"
      defaultValue={notes}
      toolbar={['bold', 'italic', 'task-list']}
      style={{ inlineSize: '13rem' }}
    />
  );
}
