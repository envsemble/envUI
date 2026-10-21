import { Toolbar } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { FormatListBulleted } from '@envsemble/envui/icons/FormatListBulleted';
import { FormatListNumbered } from '@envsemble/envui/icons/FormatListNumbered';
import { Redo } from '@envsemble/envui/icons/Redo';
import { Undo } from '@envsemble/envui/icons/Undo';

export default function GroupedControls() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button icon={<FormatBold />} label="Bold" />
        <Toolbar.Button icon={<FormatItalic />} label="Italic" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Lists">
        <Toolbar.Button icon={<FormatListBulleted />} label="Bulleted list" />
        <Toolbar.Button icon={<FormatListNumbered />} label="Numbered list" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<Undo />} label="Undo" />
      <Toolbar.Button icon={<Redo />} label="Redo" />
    </Toolbar.Root>
  );
}
