import { useState } from 'react';
import { Button, PageHeader, SearchField, SegmentedControl, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

export default function PageToolbar() {
  const [status, setStatus] = useState('open');
  return (
    // Level 3 under this section; a page's own header keeps the default, 1.
    <PageHeader
      headingLevel={3}
      title="Tasks"
      toolbar={
        // A page toolbar is a Row, not a Toolbar: the field keeps its arrow keys, and every
        // control is a tab stop. The primary action sits at the end.
        <Row wrap align="center" justify="between" gap={3}>
          <Row wrap align="center" gap={3}>
            <SearchField label="Search tasks" placeholder="Search tasks" />
            <SegmentedControl
              aria-label="Status"
              value={status}
              onValueChange={setStatus}
              items={[
                { value: 'open', label: 'Open' },
                { value: 'done', label: 'Done' },
                { value: 'all', label: 'All' },
              ]}
            />
          </Row>
          <Button startIcon={<IconAdd />}>New task</Button>
        </Row>
      }
    />
  );
}
