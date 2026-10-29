import { Column, DescriptionList, Panes, Surface, Text } from '@envsemble/envui';

export default function ResizableDetails() {
  return (
    // Each pane holds a surface, and the divider is the gap between them, with its grip in the
    // middle. It resizes the supporting pane, by pointer and the arrow keys, and the width people
    // choose is kept on this device.
    <Panes.Root
      behavior="supporting"
      splitAt="medium"
      defaultWidth={18}
      minWidth={14}
      maxWidth={28}
      persist="example.details-width"
      style={{ blockSize: '14rem' }}
    >
      <Panes.Main label="Launch banner">
        <Surface padding={4} render={<Column gap={2} />} style={{ minBlockSize: '100%' }}>
          <Text variant="title" render={<h3 />}>
            Launch banner
          </Text>
          <Text>The banner for the spring launch, on the home page and in the newsletter.</Text>
        </Surface>
      </Panes.Main>
      <Panes.Divider label="Resize details" />
      <Panes.Supporting label="Banner details">
        <Surface padding={4} render={<Column />} style={{ minBlockSize: '100%' }}>
          <DescriptionList.Root aria-label="About the banner">
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Size">1200 × 630</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Supporting>
    </Panes.Root>
  );
}
