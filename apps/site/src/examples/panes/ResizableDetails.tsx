import { Column, DescriptionList, Panes, Surface, Text } from '@envsemble/envui';

export default function ResizableDetails() {
  return (
    <Panes.Root
      sized="end"
      defaultWidth={18}
      minWidth={14}
      maxWidth={22}
      persist="example.details-width"
      style={{
        inlineSize: 'min(100%, 44rem)',
        blockSize: '14rem',
        '--env-panes-other-min': 'min(16rem, 50cqi)',
      }}
    >
      <Panes.Pane label="Launch banner">
        <Surface
          radius="none"
          padding={4}
          background="page"
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Launch banner
          </Text>
          <Text style={{ maxInlineSize: '24rem' }}>
            The banner for the spring launch, on the home page. The copy is final; the illustration
            is due on Friday.
          </Text>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize details" />
      <Panes.Pane label="Banner details">
        <Surface
          radius="none"
          padding={4}
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Details
          </Text>
          <DescriptionList.Root aria-label="About the banner">
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Size">1200 × 630</DescriptionList.Item>
            <DescriptionList.Item label="Format">PNG</DescriptionList.Item>
            <DescriptionList.Item label="Due">Friday</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
