import { useState } from 'react';
import { Column, Slider } from '@envsemble/envui';

export default function ShowTheEffect() {
  const [opacity, setOpacity] = useState(60);
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 13rem)' }}>
      {/* The layer the slider fades, in view beside it: a short inline style for the picture. */}
      <div
        aria-hidden
        style={{
          blockSize: '5rem',
          borderRadius: 'var(--env-radius-lg)',
          background: 'var(--env-color-bg-accent-emphasis)',
          opacity: opacity / 100,
        }}
      />
      <Slider
        label="Layer opacity"
        value={opacity}
        onValueChange={setOpacity}
        formatValue={(value) => `${value}%`}
      />
    </Column>
  );
}
