import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { IconFormatListNumbered } from '@envsemble/envui/icons/FormatListNumbered';
import { IconRedo } from '@envsemble/envui/icons/Redo';
import { IconUndo } from '@envsemble/envui/icons/Undo';

export default function FormattingToolbar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button
          icon={<IconFormatBold />}
          label="Bold"
          shortcut="Ctrl+B"
          pressed={bold}
          onClick={() => setBold((current) => !current)}
        />
        <Toolbar.Button
          icon={<IconFormatItalic />}
          label="Italic"
          shortcut="Ctrl+I"
          pressed={italic}
          onClick={() => setItalic((current) => !current)}
        />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Lists">
        <Toolbar.Button icon={<IconFormatListBulleted />} label="Bulleted list" />
        <Toolbar.Button icon={<IconFormatListNumbered />} label="Numbered list" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<IconUndo />} label="Undo" shortcut="Ctrl+Z" />
      <Toolbar.Button icon={<IconRedo />} label="Redo" shortcut="Ctrl+Shift+Z" disabled />
    </Toolbar.Root>
  );
}
