import { Column, DescriptionList, Panes, Surface, Text } from '@envsemble/envui';

export default function StackedWhenNarrow() {
  return (
    <Panes.Root
      stackBelow="medium"
      sized="end"
      defaultWidth={14}
      style={{ inlineSize: '100%', blockSize: '18rem' }}
    >
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
      <Panes.ResizeHandle label="Resize details" />
      <Panes.Pane label="Review details">
        <Surface radius="none" padding={4} style={{ minBlockSize: '100%' }}>
          <DescriptionList.Root aria-label="About the review">
            <DescriptionList.Item label="Owner">Sam Lee</DescriptionList.Item>
            <DescriptionList.Item label="Due">April 2</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
