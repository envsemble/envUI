import { SplitPane, Column, Text } from '@envsemble/envui';

export default function ResizablePanes() {
  return (
    // A split pane fills the height it is given; each pane scrolls on its own.
    <SplitPane.Root defaultSize={40} style={{ blockSize: '14rem' }}>
      <SplitPane.Pane label="Source">
        <Column gap={2} style={{ padding: 'var(--env-space-4)' }}>
          <Text variant="title" render={<h3 />}>
            Source
          </Text>
          <Text>Drag the handle, or focus it and press the arrow keys.</Text>
        </Column>
      </SplitPane.Pane>
      <SplitPane.ResizeHandle label="Resize source and preview" />
      <SplitPane.Pane label="Preview">
        <Column gap={2} style={{ padding: 'var(--env-space-4)' }}>
          <Text variant="title" render={<h3 />}>
            Preview
          </Text>
          <Text>A double click on the handle returns it to the default size.</Text>
        </Column>
      </SplitPane.Pane>
    </SplitPane.Root>
  );
}
