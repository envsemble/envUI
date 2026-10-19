import { useState } from 'react';
import { ColorPicker } from '@envsemble/envui';

export default function AccentColor() {
  const [color, setColor] = useState('#3b6fd4');
  return (
    // The picker fills its container; a sidebar or a popover gives it this width.
    <div style={{ inlineSize: 'min(100%, 20rem)' }}>
      <ColorPicker label="Accent color" value={color} onValueChange={setColor} />
    </div>
  );
}
