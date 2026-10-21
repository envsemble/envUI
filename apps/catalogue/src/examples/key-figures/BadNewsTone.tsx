import { Badge, Column, Text } from '@envsemble/envui';
import { TrendingUp } from '@envsemble/envui/icons/TrendingUp';

export default function BadNewsTone() {
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="muted">
        Error rate
      </Text>
      <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
        0.4%
      </Text>
      {/* A rise is bad news here: the danger tone says so, and the words say which way. */}
      <Badge tone="danger" icon={<TrendingUp />}>
        +0.1 points
      </Badge>
    </Column>
  );
}
