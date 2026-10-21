import { Column, List, Panes, Text } from '@envsemble/envui';

export default function GenericBack() {
  return (
    // A narrow window, with the message open: without backLabel, the button only says Back.
    <Panes.Root
      behavior="list-detail"
      open
      style={{ blockSize: '12rem', inlineSize: 'min(100%, 20rem)' }}
    >
      <Panes.List label="Inbox">
        <List.Root aria-label="Messages">
          <List.Item label="Launch checklist" description="Priya Shah" selected />
        </List.Root>
      </Panes.List>
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
