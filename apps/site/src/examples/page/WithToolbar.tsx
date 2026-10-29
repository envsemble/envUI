import { useState } from 'react';
import { Button, PageHeader, SearchField, SegmentedControl, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

export default function WithToolbar() {
  const [view, setView] = useState('list');
  return (
    // Level 3 inside these docs; a page's own header keeps the default, 1.
    <PageHeader
      headingLevel={3}
      title="People"
      controlSize="sm"
      actions={<Button startIcon={<IconAdd />}>Invite</Button>}
      toolbar={
        // Not a Toolbar: the field keeps its arrow keys and every control is a tab stop.
        <Row wrap align="center" justify="between" gap={3}>
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
        </Row>
      }
    />
  );
}
