import { Card, Stack, Surface, Text } from '@envsemble/envui';
import { Example } from '../Example';

export function CompositionPreview() {
  return (
    <>
      <Example title="Surface and layout on one root">
        <Surface tone="pane" padding={5} render={<Stack as="section" gap={4} />}>
          <Text as="h2" variant="section-heading">
            Workspace
          </Text>
          <Text>Shared plans and notes for the project.</Text>
        </Surface>
      </Example>
      <Example title="Product content on a shared card">
        <Card as="article">
          <Text as="h3" variant="section-heading">
            Sample project
          </Text>
          <Text tone="muted">A summary of the project and its next steps.</Text>
        </Card>
      </Example>
    </>
  );
}
