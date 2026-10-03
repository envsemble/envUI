import { Card, Stack, Surface, Text } from '@envsemble/envui';
import { Example } from '../Example';

export function CompositionPreview() {
  return (
    <>
      <Example title="Surface and layout on one root">
        <Text tone="muted">
          Surface owns fill, padding and corners; Stack owns the gaps. Compose them on the same
          element through render.
        </Text>
        <Surface tone="pane" padding={5} render={<Stack as="section" gap={4} />}>
          <Text as="h2" variant="section-heading">
            Workspace
          </Text>
          <Text>Shared plans and notes for the project.</Text>
        </Surface>
      </Example>
      <Example title="Product content on a shared card">
        <Text tone="muted">
          Wrap public primitives for product content. Keep data, routing and validation in the
          application.
        </Text>
        <Card as="article">
          <Text as="h3" variant="section-heading">
            Sample project
          </Text>
          <Text tone="muted">A summary of the project and its next steps.</Text>
        </Card>
      </Example>
      <Example title="Extending the library">
        <Text tone="muted">
          Add repeated visual behavior to envUI through public variants and slots. Use the central
          tokens and forward native props and refs from custom roots; avoid styling private markup.
        </Text>
      </Example>
    </>
  );
}
