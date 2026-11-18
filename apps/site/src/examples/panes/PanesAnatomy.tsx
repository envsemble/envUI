import { Column, List, Panes, Surface, Text } from '@envsemble/envui';

export default function PanesAnatomy() {
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultWidth={16}
      style={{ blockSize: '12rem' }}
    >
      <Panes.List label="Inbox">
        <Surface radius="none" padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            <List.Item label="Launch checklist" description="Priya Shah" current />
            <List.Item label="Budget review" description="Sam Lee" />
          </List.Root>
        </Surface>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label="Launch checklist">
        <Surface
          radius="none"
          padding={4}
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Launch checklist
          </Text>
          <Text>The venue is booked.</Text>
        </Surface>
      </Panes.Detail>
    </Panes.Root>
  );
}
