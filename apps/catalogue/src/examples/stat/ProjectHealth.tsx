import { useState } from 'react';
import { AnimatedNumber, Button, Column, Row, Stat } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function ProjectHealth() {
  const [projects, setProjects] = useState(128);
  return (
    <Column gap={4}>
      <Stat.Group aria-label="Project health">
        <Stat.Root
          label="Active projects"
          value={<AnimatedNumber value={projects} />}
          trend={{ direction: 'up', label: '+12% from last month' }}
          description="Last 30 days"
        />
        <Stat.Root
          label="Tasks done"
          value="1,284"
          trend={{ direction: 'up', label: '+86 this week' }}
        />
        <Stat.Root
          label="Lead time"
          value="2.5 days"
          trend={{ direction: 'flat', label: 'No change' }}
          description="Median"
        />
      </Stat.Group>
      <Row wrap align="center" gap={4}>
        <Button
          variant="secondary"
          startIcon={<Add />}
          onClick={() => setProjects((count) => count + 1)}
        >
          Add a project
        </Button>
      </Row>
    </Column>
  );
}
