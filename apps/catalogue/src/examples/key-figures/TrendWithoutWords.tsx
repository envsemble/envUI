import { Badge, Column, Text } from '@envsemble/envui';
import { TrendingUp } from '@envsemble/envui/icons/TrendingUp';

export default function TrendWithoutWords() {
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="muted">
        Active projects
      </Text>
      <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
        128
      </Text>
      <Badge tone="success" icon={<TrendingUp />}>
        12%
      </Badge>
    </Column>
  );
}
