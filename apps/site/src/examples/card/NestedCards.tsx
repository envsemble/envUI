import { Card, Text } from '@envsemble/envui';

export default function NestedCards() {
  return (
    <Card title="Northwind launch" meta="Due 14 November">
      <Card background="default" title="Owner">
        <Text>Priya Shah</Text>
      </Card>
      <Card background="default" title="Open tasks">
        <Text>12, of which 3 are overdue</Text>
      </Card>
    </Card>
  );
}
