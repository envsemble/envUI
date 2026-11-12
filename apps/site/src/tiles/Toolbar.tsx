import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { IconUndo } from '@envsemble/envui/icons/Undo';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { Renew } from '../motion/Renew';

const button = (label: string) => `.env-toolbar-button[aria-label="${label}"]`;

/**
 * Turns on bold and italic, one after the other. The pointer then leaves, so the two pressed
 * toggles hold their pressed fill a while, and then the toolbar is drawn again as it began, with a
 * short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: button('Bold') },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { to: button('Italic'), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 1440 },
  { cue: 'renew' },
  { wait: 300 },
];

/** A formatting toolbar: two toggles, a list and undo. */
export default function ToolbarTile() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <Formatting />
    </Renew>
  );
}

/** The toolbar, with its two toggles off when it is drawn. */
function Formatting() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button
          icon={<IconFormatBold />}
          label="Bold"
          pressed={bold}
          onClick={() => setBold((on) => !on)}
        />
        <Toolbar.Button
          icon={<IconFormatItalic />}
          label="Italic"
          pressed={italic}
          onClick={() => setItalic((on) => !on)}
        />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<IconFormatListBulleted />} label="Bulleted list" />
      <Toolbar.Button icon={<IconUndo />} label="Undo" />
    </Toolbar.Root>
  );
}
