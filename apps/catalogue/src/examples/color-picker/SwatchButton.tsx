import { useState } from 'react';
import { Button, ColorPicker, ColorSwatch, Popover } from '@envsemble/envui';

export default function SwatchButton() {
  const [color, setColor] = useState('#2f6f62');
  return (
    <Popover
      aria-label="Label color"
      trigger={
        // The swatch is decorative; the button's text names the color.
        <Button variant="secondary" startIcon={<ColorSwatch color={color} />}>
          {color.toUpperCase()}
        </Button>
      }
    >
      <ColorPicker label="Label color" value={color} onValueChange={setColor} />
    </Popover>
  );
}
