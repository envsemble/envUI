import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconUndo } from '@envsemble/envui/icons/Undo';

export default function ToolbarAnatomy() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button icon={<IconFormatBold />} label="Bold" pressed />
        <Toolbar.Button icon={<IconFormatItalic />} label="Italic" />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<IconUndo />} label="Undo" />
    </Toolbar.Root>
  );
}
