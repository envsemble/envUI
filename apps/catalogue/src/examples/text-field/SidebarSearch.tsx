import { useState } from 'react';
import { NavList, SearchField, Column, Surface, Text } from '@envsemble/envui';

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
    // As wide as a sidebar.
    <Surface background="default" padding={3} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <Column gap={2}>
        <SearchField
          variant="ghost"
          label="Find projects"
          placeholder="Find projects"
          value={query}
          onValueChange={setQuery}
        />
        {matches.length > 0 ? (
          <NavList.Root aria-label="Projects">
            {matches.map((project) => (
              <NavList.Item
                key={project}
                selected={project === current}
                onClick={() => setCurrent(project)}
              >
                {project}
              </NavList.Item>
            ))}
          </NavList.Root>
        ) : (
          <Text variant="caption" emphasis="muted">
            No projects match.
          </Text>
        )}
      </Column>
    </Surface>
  );
}
