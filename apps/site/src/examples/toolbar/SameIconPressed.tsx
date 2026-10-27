import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { FormatBold } from '@envsemble/envui/icons/FormatBold';
import { FormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function SameIconPressed() {
  const [bold, setBold] = useState(true);
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button
        icon={<FormatBold />}
        label="Bold"
        pressed={bold}
        onClick={() => setBold((current) => !current)}
      />
      <Toolbar.Button icon={<FormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
