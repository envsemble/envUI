import { useState } from 'react';
import { Button, Menu, Toolbar } from '@envsemble/envui';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { IconShare } from '@envsemble/envui/icons/Share';

const blocks = ['Paragraph', 'Heading', 'Quote'];

export default function LabelledControls() {
  const [block, setBlock] = useState('Paragraph');
  const [bold, setBold] = useState(false);
  return (
    <Toolbar.Root aria-label="Formatting">
      <Menu.Root
        aria-label="Block type"
        trigger={<Toolbar.Item render={<Button end={<IconExpandMore />}>{block}</Button>} />}
      >
        <Menu.RadioGroup value={block} onValueChange={setBlock}>
          {blocks.map((each) => (
            <Menu.RadioItem key={each} value={each}>
              {each}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Root>
      <Toolbar.Separator />
      <Toolbar.Button
        icon={<IconFormatBold />}
        label="Bold"
        shortcut="Ctrl+B"
        pressed={bold}
        onClick={() => setBold(!bold)}
      />
      <Toolbar.Button icon={<IconFormatItalic />} label="Italic" shortcut="Ctrl+I" />
      <Toolbar.Separator />
      <Toolbar.Item render={<Button start={<IconShare />}>Share</Button>} />
    </Toolbar.Root>
  );
}
