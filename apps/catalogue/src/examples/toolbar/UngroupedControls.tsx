import { Toolbar } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { FormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { FormatListNumbered } from '@envsemble/envui/icons/FormatListNumbered';
import { Redo } from '@envsemble/envui/icons/Redo';
import { Undo } from '@envsemble/envui/icons/Undo';

export default function UngroupedControls() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Button icon={<Undo />} label="Undo" />
      <Toolbar.Button icon={<FormatBold />} label="Bold" />
      <Toolbar.Button icon={<FormatListBulleted />} label="Bulleted list" />
      <Toolbar.Button icon={<Redo />} label="Redo" />
      <Toolbar.Button icon={<FormatItalic />} label="Italic" />
      <Toolbar.Button icon={<FormatListNumbered />} label="Numbered list" />
    </Toolbar.Root>
  );
}
