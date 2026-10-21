import { Button, EmptyState } from '@envsemble/envui';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

export default function EmptyStateAnatomy() {
  return (
    <EmptyState
      headingLevel={3}
      icon={<SearchOff />}
      title="No matching projects"
      description="Check the spelling or clear the search."
      action={<Button variant="secondary">Clear search</Button>}
    />
  );
}
