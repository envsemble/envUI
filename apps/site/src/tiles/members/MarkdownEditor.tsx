import { MarkdownEditor } from '@envsemble/envui/markdown';
import { useHeldView } from '../../motion/Playback';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { TileWindow } from '../Tiles';

const tab = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

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

export const tileWindow: TileWindow = { width: 16, height: 12 };

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
