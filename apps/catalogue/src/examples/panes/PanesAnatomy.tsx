import { Column, List, Panes, Text } from '@envsemble/envui';

export default function PanesAnatomy() {
  return (
    // Side by side from a medium width, so the figure shows both panes on most pages.
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultSize={16}
      style={{ blockSize: '12rem' }}
    >
      <Panes.List label="Inbox">
        <List.Root aria-label="Messages">
          <List.Item label="Launch checklist" description="Priya Shah" selected />
          <List.Item label="Budget review" description="Sam Lee" />
        </List.Root>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label="Launch checklist">
        <Column gap={2} padding={4}>
          <Text variant="title" render={<h3 />}>
            Launch checklist
          </Text>
          <Text>The venue is booked.</Text>
        </Column>
      </Panes.Detail>
    </Panes.Root>
  );
}
