import { Button, Column, Row, Text } from '@envsemble/envui';

export default function VagueLabel() {
  return (
    <Column gap={4}>
      <Text>Sam Lee will lose access to the Northwind workspace.</Text>
      <Row wrap justify="end" gap={3}>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" tone="danger">
          OK
        </Button>
      </Row>
    </Column>
  );
}
