import { Button, Column, Row, Text } from '@envsemble/envui';

export default function SeveralPrimaryActions() {
  return (
    <Column gap={4}>
      <Text>Publish the release notes to everyone on the team?</Text>
      <Row wrap justify="end" gap={3}>
        <Button>Preview</Button>
        <Button>Save draft</Button>
        <Button>Publish</Button>
      </Row>
    </Column>
  );
}
