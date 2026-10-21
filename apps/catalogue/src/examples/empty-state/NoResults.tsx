import { useRef, useState } from 'react';
import { Button, EmptyState, List, SearchField, Column, Text } from '@envsemble/envui';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

const projects = ['Northwind launch', 'Pricing research', 'Quarterly planning', 'Support handbook'];

export default function NoResults() {
  const [query, setQuery] = useState('Roadmap');
  const field = useRef<HTMLInputElement>(null);
  const matches = projects.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const clear = () => {
    setQuery('');
    // The button leaves with the empty state, so focus returns to the search.
    field.current?.focus();
  };
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <SearchField
        ref={field}
        label="Search projects"
        placeholder="Search by name"
        value={query}
        onValueChange={setQuery}
      />
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
        <EmptyState
          icon={<SearchOff />}
          headingLevel={3}
          title="No matching projects"
          description={`No project names contain “${query.trim()}”. Check the spelling or clear the search.`}
          action={
            <Button variant="secondary" onClick={clear}>
              Clear search
            </Button>
          }
        />
      )}
    </Column>
  );
}
