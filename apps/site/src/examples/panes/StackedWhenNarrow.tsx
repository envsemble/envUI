import { Column, List, Panes, Surface, Text } from '@envsemble/envui';

export default function StackedWhenNarrow() {
  return (
    <Panes.Root
      stackBelow="medium"
      defaultWidth={14}
      style={{ inlineSize: '100%', blockSize: '18rem' }}
    >
      <Panes.Pane label="Team inbox">
        <Surface radius="none" padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            <List.Item label="Budget review" description="Sam Lee" current />
            <List.Item label="Launch checklist" description="Priya Shah" />
          </List.Root>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize the inbox" />
      <Panes.Pane label="Budget review">
        <Surface
          radius="none"
          padding={4}
          background="page"
          render={<Column gap={2} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Budget review
          </Text>
          <Text>The numbers for March are in the sheet.</Text>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
