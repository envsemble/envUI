import { Button, Column, Row, Text } from '@envsemble/envui';

export default function OnePrimaryAction() {
  return (
    <Column gap={4}>
      <Text>Publish the release notes to everyone on the team?</Text>
      <Row wrap justify="end" gap={3}>
        <Button variant="secondary">Save draft</Button>
        <Button>Publish</Button>
      </Row>
    </Column>
  );
}
