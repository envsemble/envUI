import { useState } from 'react';
import { SplitPane, Stack, Text } from '@envsemble/envui';

export default function Persisted() {
  const [size, setSize] = useState<number>();
  return (
    <Stack gap={2}>
      <SplitPane.Root
        unit="rem"
        defaultSize={14}
        minSize={10}
        maxSize={24}
        persist="example.outline-width"
        onSizeChange={(next, { committed }) => committed && setSize(next)}
        style={{ blockSize: '12rem' }}
      >
        <SplitPane.Pane label="Outline">
          <Text style={{ padding: 'var(--env-space-4)' }}>
            The outline keeps the width you choose, in rem, after a reload.
          </Text>
        </SplitPane.Pane>
        <SplitPane.ResizeHandle label="Resize outline" />
        <SplitPane.Pane label="Document">
          <Text style={{ padding: 'var(--env-space-4)' }}>The document takes the rest.</Text>
        </SplitPane.Pane>
      </SplitPane.Root>
      <Text variant="caption" role="status">
        {size === undefined ? 'Resize the outline.' : `Outline width: ${size} rem`}
      </Text>
    </Stack>
  );
}
