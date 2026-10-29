import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function SameIconPressed() {
  const [bold, setBold] = useState(true);
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button
        icon={<IconFormatBold />}
        label="Bold"
        pressed={bold}
        onClick={() => setBold((current) => !current)}
      />
      <Toolbar.Button icon={<IconFormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
