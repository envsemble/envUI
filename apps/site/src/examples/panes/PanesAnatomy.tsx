import { Column, List, Panes, Surface, Text } from '@envsemble/envui';

export default function PanesAnatomy() {
  return (
    <Panes.Root
      defaultWidth={16}
      style={{
        inlineSize: 'min(100%, 38rem)',
        blockSize: '12rem',
        '--env-panes-other-min': 'min(16rem, 60cqi)',
      }}
    >
      <Panes.Pane label="Inbox">
        <Surface radius="none" padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            <List.Item label="Launch checklist" description="Priya Shah" current />
            <List.Item label="Budget review" description="Sam Lee" />
          </List.Root>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize the inbox" />
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
          <Text>The venue is booked.</Text>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
