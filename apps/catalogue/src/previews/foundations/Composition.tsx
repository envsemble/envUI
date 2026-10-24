import { Card, Column, Surface, Text } from '@envsemble/envui';
import { Example } from '../Example';

export function CompositionPreview() {
  return (
    <>
      <Example
        title="Surface and layout on one element"
        size="field"
        caption="The surface gives the fill, padding and corners, and the column the gaps, on one element."
      >
        <Surface background="default" padding={5} render={<Column render={<section />} gap={4} />}>
          <Text render={<h3 />} variant="title">
            Workspace
          </Text>
          <Text>Shared plans and notes for the project.</Text>
        </Surface>
      </Example>
      <Example
        title="Product content on a shared card"
        size="field"
        caption="Data, routing and validation stay in the application."
      >
        <Card render={<article />}>
          <Text render={<h3 />} variant="title">
            Sample project
          </Text>
          <Text emphasis="muted">A summary of the project and its next steps.</Text>
        </Card>
      </Example>
    </>
  );
}
