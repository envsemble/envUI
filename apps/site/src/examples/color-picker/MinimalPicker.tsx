import { useState } from 'react';
import { ColorPicker } from '@envsemble/envui/color';

export default function MinimalPicker() {
  const [color, setColor] = useState('#3b6fd4');
  return (
    // The picker fills its container; a sidebar or a popover gives it its width.
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <ColorPicker label="Accent color" formats={['hex']} value={color} onValueChange={setColor} />
    </div>
  );
}
