import { Button, Column, Row, Text } from '@envsemble/envui';

export default function SpecificLabel() {
  return (
    <Column gap={4}>
      <Text>Sam Lee will lose access to the Northwind workspace.</Text>
      <Row wrap justify="end" gap={3}>
        <Button variant="secondary">Keep access</Button>
        <Button variant="primary" tone="danger">
          Remove Sam Lee
        </Button>
      </Row>
    </Column>
  );
}
