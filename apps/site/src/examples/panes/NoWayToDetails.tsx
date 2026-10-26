import { Column, Panes, Text } from '@envsemble/envui';

export default function NoWayToDetails() {
  return (
    // A narrow window: the details are a closed sheet, and nothing on the page opens it.
    <Panes.Root
      behavior="supporting"
      style={{ blockSize: '12rem', inlineSize: 'min(100%, 20rem)' }}
    >
      <Panes.Main label="Roadmap">
        <Column gap={3} padding={4} align="start">
          <Text variant="title" render={<h3 />}>
            Roadmap
          </Text>
        </Column>
      </Panes.Main>
      <Panes.Supporting label="Roadmap details">
        <Column padding={4}>
          <Text>Owned by Sam Lee, due 31 March.</Text>
        </Column>
      </Panes.Supporting>
    </Panes.Root>
  );
}
