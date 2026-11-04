import { useState } from 'react';
import { Toolbar } from '@envsemble/envui';
import { IconCheck } from '@envsemble/envui/icons/Check';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';

export default function IconSwapsPressed() {
  const [bold, setBold] = useState(true);
  return (
    <Toolbar.Root aria-label="Text style">
      <Toolbar.Button
        icon={bold ? <IconCheck /> : <IconFormatBold />}
        label="Bold"
        pressed={bold}
        onClick={() => setBold((current) => !current)}
      />
      <Toolbar.Button icon={<IconFormatItalic />} label="Italic" />
    </Toolbar.Root>
  );
}
