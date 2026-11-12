import { useState } from 'react';
import { ColorPickerButton } from '@envsemble/envui/color';

export default function PickerButton() {
  const [color, setColor] = useState('#2f6f62');
  return <ColorPickerButton label="Label color" value={color} onValueChange={setColor} />;
}
