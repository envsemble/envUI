import { Column, Panes, Text } from '@envsemble/envui';

export default function ResizableDetails() {
  return (
    // The divider resizes the supporting pane, by pointer and the arrow keys, and the width people
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
        <Column padding={4}>
          <Text>The canvas takes the room the details leave.</Text>
        </Column>
      </Panes.Main>
      <Panes.Divider label="Resize details" />
      <Panes.Supporting label="Details">
        <Column padding={4}>
          <Text emphasis="muted">Drag the divider, or focus it and press the arrow keys.</Text>
        </Column>
      </Panes.Supporting>
    </Panes.Root>
  );
}
