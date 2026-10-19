import { useState } from 'react';
import { AnimatedNumber, Button, Stat, Surface, Theme, type ThemeValue } from '@envsemble/envui';

export function StatsFixture({ theme }: { theme: ThemeValue }) {
  const [reviews, setReviews] = useState(41);
  return (
    <Theme theme={theme} data-testid={`stats-${theme}`} className="fixture-section">
      <Stat.Group aria-label={`Project health ${theme}`} data-testid={`stat-group-${theme}`}>
        <Stat.Root
          label="Active projects"
          value="128"
          trend={{ direction: 'up', label: '+12% from last month' }}
          description="Last 30 days"
        />
        <Stat.Root
          label="Open risks"
          value="3"
          trend={{ direction: 'down', label: '2 fewer than last week', tone: 'success' }}
        />
        <Stat.Root
          label="Error rate"
          value="0.4%"
          trend={{ direction: 'up', label: '+0.1 points', tone: 'danger' }}
        />
        <Stat.Root
          label="Reviews"
          value={<AnimatedNumber value={reviews} />}
          trend={{ direction: 'flat', label: 'No change' }}
          description="This week"
        />
      </Stat.Group>
      <Button variant="secondary" onClick={() => setReviews((count) => count + 1)}>
        Add review {theme}
      </Button>
      <Surface background="default" padding={4} data-surface="pane">
        <Stat.Group background="muted" data-testid={`stat-row-group-${theme}`}>
          <Stat.Root
            label="Deploys"
            value="24"
            trend={{ direction: 'up', label: 'Up 4', tone: 'warning' }}
          />
          <Stat.Root label="Lead time" value="2.5 days" description="Median" />
        </Stat.Group>
      </Surface>
      <Stat.Root label="Standalone" value="7" data-testid={`stat-standalone-${theme}`} />
    </Theme>
  );
}
