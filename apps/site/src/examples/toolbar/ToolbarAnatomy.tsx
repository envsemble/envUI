import { Toolbar } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { Undo } from '@envsemble/envui/icons/Undo';

export default function ToolbarAnatomy() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button icon={<FormatBold />} label="Bold" pressed />
        <Toolbar.Button icon={<FormatItalic />} label="Italic" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<Undo />} label="Undo" />
    </Toolbar.Root>
  );
}
