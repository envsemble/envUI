import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { IconUndo } from '@envsemble/envui/icons/Undo';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';
import { Renew } from '../motion/Renew';

const button = (label: string) => `.env-toolbar-button[aria-label="${label}"]`;

/**
 * Bold and italic turned on, one after the other; the pointer then leaves, so the two pressed
 * toggles hold in their pressed fill a while, and the toolbar is drawn anew as it began, with a
 * short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: button('Bold') },
  { wait: 500 },
  { click: true },
  { wait: 500 },
  { to: button('Italic'), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 2400 },
  { cue: 'renew' },
  { wait: 500 },
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

/** The toolbar, its two toggles off as it is drawn. */
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
