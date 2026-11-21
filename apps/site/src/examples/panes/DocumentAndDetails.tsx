import { Column, DescriptionList, Panes, Surface, Text } from '@envsemble/envui';

export default function DocumentAndDetails() {
  return (
    <Panes.Root
      sized="end"
      defaultWidth={16}
      minWidth={12}
      maxWidth={22}
      style={{
        inlineSize: 'min(100%, 40rem)',
        blockSize: '18rem',
        '--env-panes-other-min': 'min(16rem, 50cqi)',
      }}
    >
      <Panes.Pane label="Launch checklist">
        <Surface
          radius="none"
          padding={4}
          background="page"
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Launch checklist
          </Text>
          <Text style={{ maxInlineSize: '26rem' }}>
            Everything the spring launch needs before it goes live: the banner, the pricing page and
            the announcement email.
          </Text>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize details" />
      <Panes.Pane label="Checklist details">
        <Surface
          radius="none"
          padding={4}
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Details
          </Text>
          <DescriptionList.Root aria-label="About the checklist">
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Status">In review</DescriptionList.Item>
            <DescriptionList.Item label="Due">March 12</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
