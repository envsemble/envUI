import { Button, Column, Row, Text } from '@envsemble/envui';

export function Form({ onSave }: { onSave: () => void }) {
  return (
    <Column gap={5} render={<form />}>
      <Text>Project details</Text>
      <Row gap={4} wrap align="center" justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </Row>
      <Column
        gap={2}
      >
        <Text>One</Text>
      </Column>
      <Row gap={0} />
    </Column>
  );
}
