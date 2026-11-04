import { useState } from 'react';
import { Button, IconButton, Row, SearchField, SegmentedControl, Select } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

// Controls of one size are as tall as each other, so the row lines up on its own.
export default function Align() {
  const [view, setView] = useState('list');
  return (
    <Row wrap gap={2} align="center">
      <SearchField label="Search reports" showLabel={false} defaultValue="Budget" />
      <Select
        aria-label="Owner"
        items={[
          { value: 'anyone', label: 'Anyone' },
          { value: 'me', label: 'Me' },
        ]}
        defaultValue="anyone"
      />
      <SegmentedControl
        aria-label="View"
        value={view}
        onValueChange={setView}
        items={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      />
      <IconButton variant="secondary" icon={<IconMoreVert />} aria-label="More" />
      <Button startIcon={<IconAdd />}>New report</Button>
    </Row>
  );
}
