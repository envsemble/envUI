import { useState } from 'react';
import { AnimatedNumber, Button, Stack, Stat, StatGroup, Surface, Text } from '@envsemble/envui';
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
