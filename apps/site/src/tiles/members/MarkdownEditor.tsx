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
  { wait: 180 },
  { to: tab(2) },
  { wait: 210 },
  { click: true },
  { wait: 1080 },
  { to: tab(1), duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 720 },
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
