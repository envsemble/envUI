import { useState } from 'react';
import { Button, Column, EmptyState, List, SearchField, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

const projects = ['Northwind launch', 'Pricing research', 'Quarterly planning'];

export default function FirstUseForNoResults() {
  const [query, setQuery] = useState('Roadmap');
  const matches = projects.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <SearchField label="Search projects" value={query} onValueChange={setQuery} />
      <Text variant="caption" emphasis="muted" role="status">
        {matches.length === 1 ? '1 project' : `${matches.length} projects`}
      </Text>
      {matches.length > 0 ? (
        <List.Root aria-label="Projects">
          {matches.map((name) => (
            <List.Item key={name} label={name} />
          ))}
        </List.Root>
      ) : (
        // Wrong: there are projects; the search matched none of them.
        <EmptyState
          headingLevel={3}
          icon={<FolderOpen />}
          title="No projects yet"
          description="Create a project to bring plans and people together."
          action={<Button startIcon={<Add />}>Create project</Button>}
        />
      )}
    </Column>
  );
}
