import { Toolbar } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function IconSwapsPressed() {
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button icon={<Check />} label="Bold" pressed />
      <Toolbar.Button icon={<FormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
