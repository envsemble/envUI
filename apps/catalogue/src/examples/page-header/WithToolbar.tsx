import { useState } from 'react';
import { Button, PageHeader, SearchField, SegmentedControl, Stack } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function WithToolbar() {
  const [view, setView] = useState('list');
  return (
    // Level 2 under this page's own heading; a page's own header keeps the default, 1.
    <PageHeader
      headingLevel={2}
      title="People"
      controlSize="sm"
      actions={<Button startIcon={<Add />}>Invite</Button>}
      toolbar={
        // Not a Toolbar: the field keeps its arrow keys and every control is a tab stop.
        <Stack direction="row" wrap align="center" justify="between" gap={3}>
          <SearchField label="Search people" size="sm" />
          <SegmentedControl
            aria-label="View"
            size="sm"
            value={view}
            onValueChange={setView}
            items={[
              { value: 'list', label: 'List' },
              { value: 'cards', label: 'Cards' },
            ]}
          />
        </Stack>
      }
    />
  );
}
