import { useState } from 'react';
import { Slider } from '@envsemble/envui';

export default function LayerOpacity() {
  const [opacity, setOpacity] = useState(40);
  return (
    // As wide as a form column.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label="Opacity"
        description="Applies to the selected layer."
        value={opacity}
        onValueChange={setOpacity}
        formatValue={(value) => `${value}%`}
      />
    </div>
  );
}
