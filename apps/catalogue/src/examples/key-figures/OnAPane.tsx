import { useId } from 'react';
import { Badge, Column, Grid, Surface, Text } from '@envsemble/envui';
import { TrendingUp } from '@envsemble/envui/icons/TrendingUp';

export default function OnAPane() {
  const headingId = useId();
  return (
    <Surface background="default" padding={5} render={<Column gap={4} />}>
      <Text render={<h3 />} variant="title" id={headingId}>
        Design review
      </Text>
      {/* On a pane, the muted fill sets the figures apart; the heading names them. */}
      <Surface
        background="muted"
        padding={4}
        role="group"
        aria-labelledby={headingId}
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
            Comments
          </Text>
          <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
            24
          </Text>
          <Text variant="body-sm" emphasis="muted">
            From 6 people
          </Text>
        </Column>
        <Column gap={1}>
          <Text variant="body-sm" emphasis="muted">
            Resolved
          </Text>
          <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
            18
          </Text>
          <Badge tone="success" icon={<TrendingUp />}>
            +5 today
          </Badge>
        </Column>
      </Surface>
    </Surface>
  );
}
