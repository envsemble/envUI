import { useState } from 'react';
import { CopyButton, Stack, Text } from '@envsemble/envui';

export default function CustomClipboard() {
  const [held, setHeld] = useState('');
  // Stands in for the application's own clipboard, such as a desktop shell's bridge.
  async function write(text: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setHeld(text);
  }
  return (
    <Stack align="start" gap={2}>
      <CopyButton value="RPT-2041" write={write} variant="outline">
        Copy ID
      </CopyButton>
      <Text variant="caption">{held ? `The clipboard holds ${held}.` : 'Nothing copied yet.'}</Text>
    </Stack>
  );
}
