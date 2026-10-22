import { Column, Panes, Surface, Text } from '@envsemble/envui';

export default function ResizableDetails() {
  return (
    // Each pane holds a surface, and the divider is the gap between them, with its grip in the
    // middle. It resizes the supporting pane, by pointer and the arrow keys, and the width people
    // choose is kept on this device.
    <Panes.Root
      behavior="supporting"
      splitAt="medium"
      defaultSize={18}
      minSize={14}
      maxSize={28}
      persist="example.details-width"
      style={{ blockSize: '14rem' }}
    >
      <Panes.Main label="Canvas">
        <Surface padding={4} render={<Column />} style={{ minBlockSize: '100%' }}>
          <Text>The canvas takes the room the details leave.</Text>
        </Surface>
      </Panes.Main>
      <Panes.Divider label="Resize details" />
      <Panes.Supporting label="Canvas details">
        <Surface padding={4} render={<Column />} style={{ minBlockSize: '100%' }}>
          <Text emphasis="muted">Drag the gap, or focus it and press the arrow keys.</Text>
        </Surface>
      </Panes.Supporting>
    </Panes.Root>
  );
}
