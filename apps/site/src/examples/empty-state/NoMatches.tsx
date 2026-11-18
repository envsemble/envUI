import { Button, Column, EmptyState, SearchField } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';

export default function NoMatches() {
  return (
    <Column gap={6}>
      <SearchField label="Search files" defaultValue="roadmap" />
      <EmptyState
        icon={<IconSearchOff />}
        title="No matching files"
        description="Nothing matches “roadmap” in this folder."
        actions={<Button>Clear search</Button>}
      />
    </Column>
  );
}
