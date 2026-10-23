import { Card, Column, Text } from '@envsemble/envui';

export default function Backgrounds() {
  return (
    // As wide as a column of cards.
    <Column gap={4} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Card title="Northwind launch">
        <Text emphasis="muted">Plans and milestones for the spring launch.</Text>
      </Card>
      <Card background="default" title="Notifications">
        <Text emphasis="muted">Email for mentions and a weekly summary.</Text>
      </Card>
      <Card background="page" title="Quarterly report">
        <Text emphasis="muted">Figures for the last three months.</Text>
      </Card>
    </Column>
  );
}
