import { Table } from '@envsemble/envui';

const files = [
  { name: 'launch-plan.pdf', size: 1240 },
  { name: 'page-inventory.xlsx', size: 84 },
  { name: 'team-photo.jpg', size: 312 },
];

export default function NumbersAlignedEnd() {
  return (
    // Numbers align to the end, in tabular figures, so they compare down the column.
    <Table.Root aria-label="Files" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell numeric>Size (KB)</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {files.map((file) => (
          <Table.Row key={file.name}>
            <Table.Cell>{file.name}</Table.Cell>
            <Table.Cell numeric>{file.size.toLocaleString('en')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
