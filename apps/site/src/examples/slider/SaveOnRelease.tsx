import { useEffect, useRef, useState } from 'react';
import { Slider, Column, Text } from '@envsemble/envui';

export default function SaveOnRelease() {
  const [volume, setVolume] = useState(60);
  const [status, setStatus] = useState('Saved at 60%.');
  const simulatedSaveRequest = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(simulatedSaveRequest.current), []);
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label="Notification volume"
        value={volume}
        onValueChange={setVolume}
        onValueCommitted={(value) => {
          setStatus('Saving…');
          clearTimeout(simulatedSaveRequest.current);
          simulatedSaveRequest.current = setTimeout(() => setStatus(`Saved at ${value}%.`), 600);
        }}
        formatValue={(value) => `${value}%`}
      />
      <Text variant="body-sm" role="status">
        {status}
      </Text>
    </Column>
  );
}
