import { Card, Stack, Surface, Text } from '@envsemble/envui';
import { Example } from '../Example';

export function CompositionPreview() {
  return (
    <>
      <Example title="Surface and layout on one root">
        <Text emphasis="muted">
          Surface owns fill, padding and corners; Stack owns the gaps. Compose them on the same
          element through render.
        </Text>
        <Surface background="default" padding={5} render={<Stack render={<section />} gap={4} />}>
          <Text render={<h2 />} variant="title">
            Workspace
          </Text>
          <Text>Shared plans and notes for the project.</Text>
        </Surface>
      </Example>
      <Example title="Product content on a shared card">
        <Text emphasis="muted">
          Wrap public primitives for product content. Keep data, routing and validation in the
          application.
        </Text>
        <Card as="article">
          <Text render={<h3 />} variant="title">
            Sample project
          </Text>
          <Text emphasis="muted">A summary of the project and its next steps.</Text>
        </Card>
      </Example>
      <Example title="Extending the library">
        <Text emphasis="muted">
          Add repeated visual behavior to envUI through public variants and slots. Use the central
          tokens and forward native props and refs from custom roots; avoid styling private markup.
        </Text>
      </Example>
    </>
  );
}
