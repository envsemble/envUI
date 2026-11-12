import { useEffect, useRef, useState } from 'react';
import { Slider, Column, Text } from '@envsemble/envui';

export default function SaveOnRelease() {
  const [volume, setVolume] = useState(60);
  const [status, setStatus] = useState('Saved at 60%.');
  const saving = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(saving.current), []);
  return (
    // As wide as a form column.
    <Column gap={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label="Notification volume"
        value={volume}
        // The value follows the thumb as it moves…
        onValueChange={setVolume}
        // …and is saved once, when the change is complete.
        onValueCommitted={(value) => {
          setStatus('Saving…');
          clearTimeout(saving.current);
          // Stands in for a request to save the setting.
          saving.current = setTimeout(() => setStatus(`Saved at ${value}%.`), 600);
        }}
        formatValue={(value) => `${value}%`}
      />
      <Text variant="body-sm" role="status">
        {status}
      </Text>
    </Column>
  );
}
