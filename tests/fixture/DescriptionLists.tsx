import { useState } from 'react';
import { Badge, Button, DescriptionList, Select, Stack } from '@envsemble/envui';

/** Description lists: one whose container the test narrows, a stacked one, and one with controls. */
export function DescriptionListsFixture() {
  const [width, setWidth] = useState('40rem');
  return (
    <Stack gap={5} className="fixture-section">
      <Stack direction="row" gap={2}>
        <Button variant="secondary" onClick={() => setWidth('40rem')}>
          Wide list
        </Button>
        <Button variant="secondary" onClick={() => setWidth('16rem')}>
          Narrow list
        </Button>
      </Stack>
      <div style={{ inlineSize: width }}>
        <DescriptionList.Root data-testid="auto" aria-label="Project facts">
          <DescriptionList.Item label="Owner">Alex Morgan</DescriptionList.Item>
          <DescriptionList.Item label="Status">
            <Badge tone="success">Active</Badge>
          </DescriptionList.Item>
          <DescriptionList.Item label="Last updated">4 March 2026</DescriptionList.Item>
        </DescriptionList.Root>
      </div>
      <DescriptionList.Root data-testid="stacked" layout="stacked" size="md">
        <DescriptionList.Item label="Email">sam.lee@example.com</DescriptionList.Item>
        <DescriptionList.Item label="Team">Design</DescriptionList.Item>
      </DescriptionList.Root>
      <DescriptionList.Root data-testid="controls" controls layout="inline">
        <DescriptionList.Item label="Visibility">
          <Select
            aria-label="Visibility"
            size="sm"
            defaultValue="team"
            items={[
              { value: 'team', label: 'Team' },
              { value: 'public', label: 'Public' },
            ]}
          />
        </DescriptionList.Item>
        <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
      </DescriptionList.Root>
    </Stack>
  );
}
