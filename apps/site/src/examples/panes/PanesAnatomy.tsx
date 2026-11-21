import { Column, DescriptionList, Panes, Surface, Text } from '@envsemble/envui';

export default function PanesAnatomy() {
  return (
    <Panes.Root
      sized="end"
      defaultWidth={14}
      style={{
        inlineSize: 'min(100%, 38rem)',
        blockSize: '12rem',
        '--env-panes-other-min': 'min(16rem, 60cqi)',
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
          <Text>The banner, the pricing page and the email.</Text>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize details" />
      <Panes.Pane label="Checklist details">
        <Surface radius="none" padding={4} style={{ minBlockSize: '100%' }}>
          <DescriptionList.Root aria-label="About the checklist">
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Due">March 12</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
