import { useState } from 'react';
import { AnimatedNumber, Button, Stack, Stat, Surface, Text } from '@envsemble/envui';
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
        <Stat.Group aria-label="Project health">
          <Stat.Root
            label="Active projects"
            value={<AnimatedNumber value={projects} />}
            trend={{ direction: 'up', label: '+12% from last month' }}
            detail="Last 30 days"
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
            label="Lead time"
            value="2.5 days"
            trend={{ direction: 'flat', label: 'No change' }}
            detail="Median"
          />
        </Stat.Group>
      </Example>
      <Example
        title="On a pane"
        caption="On a pane, the group takes the row tone so its stats stand apart."
      >
        <Surface tone="pane" padding={5} render={<Stack gap={4} />}>
          <Text as="h3" variant="section-heading">
            Design review
          </Text>
          <Stat.Group tone="row" padding={4}>
            <Stat.Root label="Comments" value="24" detail="From 6 people" />
            <Stat.Root label="Resolved" value="18" trend={{ direction: 'up', label: '+5 today' }} />
          </Stat.Group>
        </Surface>
      </Example>
    </Preview>
  );
}
