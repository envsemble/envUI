import { MarkdownEditor } from '@envsemble/envui/markdown';
import { useHeldView } from '../../motion/Playback';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { TileWindow } from '../Tiles';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/**
 * Chooses Preview: the Markdown written under Write renders, with its bold phrase bold. Then Write
 * again, showing its source as it was typed.
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

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 16, height: 12 };

/**
 * A Markdown editor without its toolbar, so it shows whole: a short note with a phrase marked bold,
 * and its Write and Preview tabs, showing the source and what it renders. Framed on Write, the
 * taller tab, its view holds while the preview shows.
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
