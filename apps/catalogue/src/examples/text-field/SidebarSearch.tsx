import { useState } from 'react';
import { Drawer, SearchField, Text } from '@envsemble/envui';

const projects = [
  'Northwind launch',
  'Quarterly report',
  'Hiring plan',
  'Office move',
  'Design review',
];

export default function SidebarSearch() {
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(projects[0]);
  const matches = projects.filter((project) =>
    project.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Drawer
      aria-label="Projects"
      header={
        <SearchField
          variant="ghost"
          label="Find projects"
          placeholder="Find projects"
          value={query}
          onValueChange={setQuery}
        />
      }
      destinations={matches.map((project) => ({
        label: project,
        current: project === current,
        onSelect: () => setCurrent(project),
      }))}
      footer={
        matches.length === 0 && (
          <Text variant="caption" emphasis="muted">
            No projects match.
          </Text>
        )
      }
    />
  );
}
