import { Badge, Column, Grid, Row, Surface, Text } from '@envsemble/envui';
import { TrendingDown } from '@envsemble/envui/icons/TrendingDown';

export default function KeyFiguresAnatomy() {
  return (
    <Surface
      role="group"
      aria-label="Project health"
      render={
        <Grid
          name="key-figures"
          columns="repeat(auto-fit, minmax(min(100%, 11rem), 1fr))"
          gap={5}
        />
      }
    >
      <Column gap={1}>
        <Text variant="body-sm" emphasis="muted">
          Lead time
        </Text>
        <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
          2.5 days
        </Text>
        <Row wrap align="center" gap={2}>
          <Badge tone="success" icon={<TrendingDown />}>
            0.5 days faster
          </Badge>
          <Text render={<span />} variant="body-sm" emphasis="muted">
            Median
          </Text>
        </Row>
      </Column>
    </Surface>
  );
}
