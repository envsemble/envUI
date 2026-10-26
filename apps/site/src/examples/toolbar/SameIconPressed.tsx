import { Toolbar } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function SameIconPressed() {
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button icon={<FormatBold />} label="Bold" pressed />
      <Toolbar.Button icon={<FormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
