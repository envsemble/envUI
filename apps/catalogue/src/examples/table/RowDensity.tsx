import { useState } from 'react';
import { ActionGroup, Button, IconButton, SegmentedControl, Stack, Table } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

const reports = [
  { id: 'q1', name: 'First quarter review', owner: 'Priya Shah', pages: 18 },
  { id: 'audit', name: 'Accessibility audit', owner: 'Sam Lee', pages: 42 },
  { id: 'survey', name: 'Customer survey', owner: 'Alex Morgan', pages: 9 },
  { id: 'roadmap', name: 'Roadmap', owner: 'Jordan Kim', pages: 6 },
];

export default function CompactDensity() {
  const [density, setDensity] = useState<'standard' | 'compact'>('compact');
  return (
    <Stack gap={3}>
      <ActionGroup>
        <SegmentedControl
          aria-label="Row density"
          size="compact"
          value={density}
          onValueChange={(value) => setDensity(value === 'standard' ? 'standard' : 'compact')}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </ActionGroup>
      <Table.Root aria-label="Reports" density={density}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Report</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell numeric>Pages</Table.HeaderCell>
            <Table.HeaderCell align="end">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {reports.map((report) => (
            <Table.Row key={report.id}>
              <Table.Cell>{report.name}</Table.Cell>
              <Table.Cell nowrap>{report.owner}</Table.Cell>
              <Table.Cell numeric>{report.pages}</Table.Cell>
              <Table.Cell align="end">
                {/* In a compact table, buttons take the compact height. */}
                <ActionGroup align="end">
                  <Button variant="text">Open</Button>
                  <IconButton
                    variant="quiet"
                    icon={<MoreVert />}
                    aria-label={`More for ${report.name}`}
                  />
                </ActionGroup>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}
