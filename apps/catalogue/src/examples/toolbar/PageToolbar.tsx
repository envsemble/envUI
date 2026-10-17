import { useState } from 'react';
import { Button, PageHeader, SearchField, Select, Stack } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function PageToolbar() {
  const [status, setStatus] = useState<string | null>('open');
  return (
    <PageHeader
      title="Tasks"
      toolbar={
        // A page toolbar is a Stack, not a Toolbar: the field keeps its arrow keys, and every
        // control is a tab stop. The primary action sits at the end.
        <Stack direction="row" wrap align="end" justify="between" gap={3}>
          <Stack direction="row" wrap align="end" gap={3}>
            <SearchField label="Search tasks" />
            <Select
              label="Status"
              value={status}
              onValueChange={setStatus}
              items={[
                { value: 'open', label: 'Open' },
                { value: 'done', label: 'Done' },
                { value: 'all', label: 'All' },
              ]}
            />
          </Stack>
          <Button startIcon={<Add />}>New task</Button>
        </Stack>
      }
    />
  );
}
