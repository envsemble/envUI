import { Badge, Card, Column, Row, Text } from '@envsemble/envui';
import { IconTrendingDown } from '@envsemble/envui/icons/TrendingDown';

export default function InACard() {
  return (
    // One figure in a card's frame; a fall that is good news in the success tone.
    <Card>
      <Column gap={1}>
        <Text variant="body-sm" emphasis="muted">
          Open invoices
        </Text>
        <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          €12,800
        </Text>
        <Row wrap align="center" gap={2}>
          <Badge tone="success" icon={<IconTrendingDown />}>
            3 fewer than last month
          </Badge>
          <Text render={<span />} variant="body-sm" emphasis="muted">
            Due within 30 days
          </Text>
        </Row>
      </Column>
    </Card>
  );
}
