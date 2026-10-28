import { Button, Column, Row, Surface, Text } from '@envsemble/envui';

// Each part takes a role, never a color; the theme gives every role its color.
export default function Roles() {
  return (
    <Surface background="page" padding={5} radius="xl">
      <Surface background="default" padding={5} radius="xl" render={<Column gap={5} />}>
        <Text render={<h3 />} variant="title">
          Quarterly report
        </Text>
        <Surface background="muted" padding={4} radius="sm" render={<Column gap={1} />}>
          <Text variant="title">£34,000</Text>
          <Text emphasis="muted">Spent of £50,000</Text>
        </Surface>
        <Row justify="end">
          <Button>Share</Button>
        </Row>
      </Surface>
    </Surface>
  );
}
