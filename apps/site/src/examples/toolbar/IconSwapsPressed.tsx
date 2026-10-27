import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function IconSwapsPressed() {
  const [bold, setBold] = useState(true);
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button
        icon={bold ? <Check /> : <FormatBold />}
        label="Bold"
        pressed={bold}
        onClick={() => setBold((current) => !current)}
      />
      <Toolbar.Button icon={<FormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
