import { useState, type ReactNode } from 'react';
import {
  AnimatedNumber,
  Badge,
  Button,
  Column,
  Grid,
  Row,
  Surface,
  Text,
  type BadgeTone,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
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
  value: ReactNode;
  trend?: { icon: ReactNode; label: string; tone: BadgeTone };
  description?: string;
}) {
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="muted">
        {label}
      </Text>
      {/* Tabular digits, so the figure keeps its width as it changes. */}
      <Text variant="headline" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      {(trend || description) && (
        <Row wrap align="center" gap={2}>
          {trend && (
            <Badge tone={trend.tone} icon={trend.icon}>
              {trend.label}
            </Badge>
          )}
          {description && (
            <Text render={<span />} variant="body-sm" emphasis="muted">
              {description}
            </Text>
          )}
        </Row>
      )}
    </Column>
  );
}

/** Active projects a month ago, which the trend compares with. */
const lastMonth = 114;

export default function ProjectHealth() {
  const [projects, setProjects] = useState(128);
  const change = Math.round(((projects - lastMonth) / lastMonth) * 100);
  return (
    <Column gap={4}>
      {/* As many even columns as fit, each at least 11 rem wide; named, so it reads as a group. */}
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
          value={<AnimatedNumber value={projects} />}
          trend={{ icon: <IconTrendingUp />, label: `+${change}%`, tone: 'success' }}
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
      <Row wrap align="center" gap={4}>
        <Button
          variant="secondary"
          startIcon={<IconAdd />}
          onClick={() => setProjects((count) => count + 1)}
        >
          Add a project
        </Button>
      </Row>
    </Column>
  );
}
