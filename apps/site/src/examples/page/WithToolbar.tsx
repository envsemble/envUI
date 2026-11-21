import { useState } from 'react';
import { Button, PageHeader, SearchField, SegmentedControl, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

export default function WithToolbar() {
  const [view, setView] = useState('list');
  return (
    <PageHeader
      headingLevel={3}
      title="People"
      controlSize="sm"
      actions={<Button start={<IconAdd />}>Invite</Button>}
      toolbar={
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
