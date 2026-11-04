import { useState } from 'react';
import {
  Button,
  IconButton,
  SegmentedControl,
  Column,
  Row,
  Table,
  type RowDensity as Density,
} from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';

const reports = [
  { id: 'q1', name: 'First quarter review', owner: 'Priya Shah', pages: 18 },
  { id: 'audit', name: 'Accessibility audit', owner: 'Sam Lee', pages: 42 },
  { id: 'survey', name: 'Customer survey', owner: 'Alex Morgan', pages: 9 },
  { id: 'roadmap', name: 'Roadmap', owner: 'Jordan Kim', pages: 6 },
];
const densities: readonly Density[] = ['xs', 'sm', 'md', 'lg'];
const names: Record<Density, string> = {
  xs: 'Extra small',
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};

export default function RowDensity() {
  const [density, setDensity] = useState<Density>('sm');
  return (
    <Column gap={3}>
      <Row wrap align="center" gap={4}>
        <SegmentedControl
          aria-label="Row density"
          size="sm"
          value={density}
          onValueChange={(value) => setDensity(densities.find((each) => each === value) ?? 'md')}
          items={densities.map((value) => ({ value, label: names[value] }))}
        />
      </Row>
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
              <Table.Cell nowrap>{report.name}</Table.Cell>
              <Table.Cell nowrap>{report.owner}</Table.Cell>
              <Table.Cell numeric>{report.pages}</Table.Cell>
              <Table.Cell align="end">
                {/* Buttons in the cells take the small control height at every density. */}
                <Row wrap align="center" gap={4} justify="end">
                  <Button variant="text">Open</Button>
                  <IconButton
                    variant="ghost"
                    icon={<IconMoreVert />}
                    aria-label={`More for ${report.name}`}
                  />
                </Row>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}
