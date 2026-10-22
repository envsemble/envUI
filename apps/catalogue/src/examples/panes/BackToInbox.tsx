import { Column, List, Panes, Text } from '@envsemble/envui';

export default function BackToInbox() {
  return (
    // A narrow window, with the message open: the back button names where it goes.
    <Panes.Root
      behavior="list-detail"
      open
      backLabel="Inbox"
      style={{ blockSize: '12rem', inlineSize: 'min(100%, 20rem)' }}
    >
      <Panes.List label="Inbox">
        <List.Root aria-label="Messages">
          <List.Item label="Seating plan" description="Priya Shah" selected />
        </List.Root>
      </Panes.List>
      <Panes.Detail label="Seating plan">
        <Column gap={2} padding={4}>
          <Text variant="title" render={<h3 />}>
            Seating plan
          </Text>
          <Text>The venue is booked.</Text>
        </Column>
      </Panes.Detail>
    </Panes.Root>
  );
}
