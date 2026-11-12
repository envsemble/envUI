import { Table } from '@envsemble/envui';

const reports = [
  { name: 'Quarterly report', owner: 'Priya Shah' },
  { name: 'Accessibility audit', owner: 'Sam Lee' },
  { name: 'Pricing research', owner: 'Alex Morgan' },
];

// Tighter rows for scanning: only the space in each row changes; the text keeps its size.
export default function Rows() {
  return (
    <Table.Root aria-label="Reports" density="sm">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Report</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {reports.map((report) => (
          <Table.Row key={report.name}>
            <Table.Cell>{report.name}</Table.Cell>
            <Table.Cell>{report.owner}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
