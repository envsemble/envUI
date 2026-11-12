import { Button, Column, PageHeader, SearchField, Text } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';

export default function EmptyStatesAnatomy() {
  return (
    // The header and its search stay; the state takes the place of the list.
    <Column gap={6} style={{ inlineSize: 'min(100%, 30rem)' }}>
      <PageHeader
        title="Projects"
        headingLevel={3}
        toolbar={<SearchField label="Search projects" defaultValue="roadmap" />}
      />
      <Column gap={4} padding={5}>
        <Text render={<span />} emphasis="muted">
          <IconSearchOff width="1.5rem" height="1.5rem" />
        </Text>
        <Column gap={2}>
          <Text render={<h4 />} variant="title">
            No matching projects
          </Text>
          <Text variant="body-sm">
            Nothing matches “roadmap”. Try other words, or clear the search.
          </Text>
        </Column>
        <Button variant="secondary">Clear search</Button>
      </Column>
    </Column>
  );
}
