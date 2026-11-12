import type { ReactNode } from 'react';
import { Badge, Column, Grid, Row, Surface, Text, type BadgeTone } from '@envsemble/envui';
import { IconTrendingFlat } from '@envsemble/envui/icons/TrendingFlat';
import { IconTrendingUp } from '@envsemble/envui/icons/TrendingUp';

/** A labelled figure, with how it changed in words and over what period. */
function KeyFigure({
  label,
  value,
  trend,
  description,
}: {
  label: string;
  value: string;
  trend: { icon: ReactNode; label: string; tone: BadgeTone };
  description?: string;
}) {
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="muted">
        {label}
      </Text>
      <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      <Row wrap align="center" gap={2}>
        <Badge tone={trend.tone} icon={trend.icon}>
          {trend.label}
        </Badge>
        {description && (
          <Text render={<span />} variant="body-sm" emphasis="muted">
            {description}
          </Text>
        )}
      </Row>
    </Column>
  );
}

export default function GroupColumns() {
  return (
    // As many even columns as fit, each at least 11 rem wide, and one column below that.
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
      <KeyFigure
        label="Active projects"
        value="128"
        trend={{ icon: <IconTrendingUp />, label: '+12%', tone: 'success' }}
        description="Last 30 days"
      />
      <KeyFigure
        label="Tasks done"
        value="1,284"
        trend={{ icon: <IconTrendingUp />, label: '+86', tone: 'success' }}
        description="This week"
      />
      <KeyFigure
        label="Lead time"
        value="2.5 days"
        trend={{ icon: <IconTrendingFlat />, label: 'No change', tone: 'neutral' }}
        description="Median"
      />
    </Surface>
  );
}
