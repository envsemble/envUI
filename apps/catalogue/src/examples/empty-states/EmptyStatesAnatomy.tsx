import { Button, Column, EmptyState, PageHeader, SearchField } from '@envsemble/envui';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

export default function EmptyStatesAnatomy() {
  return (
    // The header and its search stay; the state takes the place of the list.
    <Column gap={6} style={{ inlineSize: 'min(100%, 30rem)' }}>
      <PageHeader
        title="Projects"
        headingLevel={3}
        toolbar={<SearchField label="Search projects" defaultValue="roadmap" />}
      />
      <EmptyState
        icon={<SearchOff />}
        title="No matching projects"
        description="Nothing matches “roadmap”. Try other words, or clear the search."
        action={<Button variant="secondary">Clear search</Button>}
        headingLevel={4}
      />
    </Column>
  );
}
