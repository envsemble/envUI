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
          <List.Item label="Press release" description="Priya Shah" selected />
        </List.Root>
      </Panes.List>
      <Panes.Detail label="Press release">
        <Column gap={2} padding={4}>
          <Text variant="title" render={<h3 />}>
            Press release
          </Text>
          <Text>The draft is ready for review.</Text>
        </Column>
      </Panes.Detail>
    </Panes.Root>
  );
}
