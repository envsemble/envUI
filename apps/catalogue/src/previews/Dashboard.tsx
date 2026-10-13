import { useMemo, useState } from 'react';
import {
  AnimatedNumber,
  Button,
  Heatmap,
  Kbd,
  Stack,
  Stat,
  StatGroup,
  Surface,
  Text,
  type HeatmapDay,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Example } from './Example';
import { Preview } from './Preview';

export function StatsPreview() {
  const [projects, setProjects] = useState(128);
  return (
    <Preview>
      <Example
        title="Key figures"
        size="wide"
        actions={
          <Button
            variant="secondary"
            startIcon={<Add />}
            onClick={() => setProjects((count) => count + 1)}
          >
            Add a project
          </Button>
        }
        caption="Stats share one pane in as many even columns as fit and wrap as space runs out. A trend shows an icon and text in its tone."
      >
        <StatGroup aria-label="Project health">
          <Stat
            label="Active projects"
            value={<AnimatedNumber value={projects} />}
            trend={{ direction: 'up', label: '+12% from last month' }}
            detail="Last 30 days"
          />
          <Stat
            label="Open risks"
            value="3"
            trend={{ direction: 'down', label: '2 fewer than last week', tone: 'success' }}
          />
          <Stat
            label="Error rate"
            value="0.4%"
            trend={{ direction: 'up', label: '+0.1 points', tone: 'danger' }}
          />
          <Stat
            label="Lead time"
            value="2.5 days"
            trend={{ direction: 'flat', label: 'No change' }}
            detail="Median"
          />
        </StatGroup>
      </Example>
      <Example
        title="On a pane"
        caption="On a pane, the group takes the row tone so its stats stand apart."
      >
        <Surface tone="pane" padding={5} render={<Stack gap={4} />}>
          <Text as="h3" variant="section-heading">
            Design review
          </Text>
          <StatGroup tone="row" padding={4}>
            <Stat label="Comments" value="24" detail="From 6 people" />
            <Stat label="Resolved" value="18" trend={{ direction: 'up', label: '+5 today' }} />
          </StatGroup>
        </Surface>
      </Example>
    </Preview>
  );
}

/** A repeatable year of activity ending today: busier midweek, with quiet stretches. */
function activityYear(days: number, seed: number): HeatmapDay[] {
  const today = new Date();
  const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Array.from({ length: days }, (_, index) => {
    const time = end - (days - 1 - index) * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin((index + seed) / 9) + Math.sin((index * 5 + seed) / 23) + 0.6;
    const weekend = weekday === 0 || weekday === 6 ? 0.3 : 1;
    return {
      date: new Date(time).toISOString().slice(0, 10),
      value: Math.max(0, Math.round(wave * 3 * weekend)),
    };
  });
}

export function HeatmapPreview() {
  const activity = useMemo(() => activityYear(371, 4), []);
  const deployments = useMemo(
    () =>
      activityYear(140, 11).map((day) => ({
        ...day,
        label: `${day.value} ${day.value === 1 ? 'deployment' : 'deployments'}`,
      })),
    [],
  );
  return (
    <Preview>
      <Example
        title="A year of activity"
        size="wide"
        caption={
          <>
            Hover or focus a day for its value. The grid is one tab stop: <Kbd>↑</Kbd> and{' '}
            <Kbd>↓</Kbd> move by day, <Kbd>←</Kbd> and <Kbd>→</Kbd> by week. Narrow windows scroll
            the weeks, starting at the most recent.
          </>
        }
      >
        <Heatmap aria-label="Activity in the last year" data={activity} />
      </Example>
      <Example
        title="A tone and weeks from Monday"
        caption="Each step mixes the tone into the canvas; labels can name the unit of each day."
      >
        <Heatmap
          aria-label="Deployments in the last twenty weeks"
          data={deployments}
          tone="success"
          weekStart={1}
          levels={4}
        />
      </Example>
    </Preview>
  );
}
