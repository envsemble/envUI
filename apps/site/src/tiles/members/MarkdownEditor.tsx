import { MarkdownEditor } from '@envsemble/envui/markdown';
import { useHeldView } from '../../motion/Playback';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/**
 * Preview chosen: the Markdown written under Write renders, its bold phrase bold; then Write
 * again, its source as it was typed.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab(2) },
  { wait: 350 },
  { click: true },
  { wait: 1800 },
  { to: tab(1), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 1200 },
];

/**
 * A Markdown editor without its toolbar, so it shows whole: a short note whose phrase is marked
 * bold, its Write and Preview tabs showing the source and what it renders. Framed on Write, the
 * taller, its view holds as the preview shows.
 */
export default function MarkdownEditorTile() {
  useHeldView();
  usePointer(script);
  return (
    <MarkdownEditor
      aria-label="Note"
      toolbar={false}
      sizing="content"
      rows={2}
      defaultValue={'Ship the **pricing page**.'}
      style={{ inlineSize: '12.5rem' }}
    />
  );
}
