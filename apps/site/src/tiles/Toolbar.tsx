import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { IconUndo } from '@envsemble/envui/icons/Undo';
import { usePointer, type PointerStep } from '../motion/Motion';

const button = (label: string) => `.env-toolbar-button[aria-label="${label}"]`;

/** Bold and italic turned on, one after the other, and off again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: button('Bold') },
  { wait: 500 },
  { click: true },
  { wait: 500 },
  { to: button('Italic'), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: button('Bold'), duration: 350 },
  { click: true },
  { wait: 250 },
  { to: button('Italic'), duration: 300 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/** A formatting toolbar: two toggles, a list and undo. */
export default function ToolbarTile() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  usePointer(script, {
    onRest: () => {
      setBold(false);
      setItalic(false);
    },
  });
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
