import { useState } from 'react';
import { IconButton, Toolbar } from '@envsemble/envui';
import { ColorPickerButton } from '@envsemble/envui/color';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatColorText } from '@envsemble/envui/icons/FormatColorText';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';

const textColors = [
  { color: '#1f2328', label: 'Default' },
  { color: '#c2413b', label: 'Red' },
  { color: '#d98a1f', label: 'Amber' },
  { color: '#2f6f62', label: 'Teal' },
  { color: '#3b6fd4', label: 'Blue' },
  { color: '#6b4fa3', label: 'Violet' },
];

export default function TextColorInToolbar() {
  const [color, setColor] = useState('#c2413b');
  return (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Button icon={<IconFormatBold />} label="Bold" />
      <Toolbar.Button icon={<IconFormatItalic />} label="Italic" />
      <ColorPickerButton
        label="Text color"
        value={color}
        onValueChange={setColor}
        swatches={textColors}
        swatchesFirst
        fields={false}
        trigger={({ value }) => (
          <Toolbar.Item
            render={
              <IconButton
                aria-label="Text color"
                icon={<IconFormatColorText />}
                style={{ boxShadow: `inset 0 -3px 0 ${value}` }}
              />
            }
          />
        )}
      />
    </Toolbar.Root>
  );
}
