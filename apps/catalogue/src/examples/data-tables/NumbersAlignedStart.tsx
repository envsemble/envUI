import { Table } from '@envsemble/envui';

const files = [
  { name: 'launch-plan.pdf', size: 1240 },
  { name: 'page-inventory.xlsx', size: 84 },
  { name: 'team-photo.jpg', size: 312 },
];

export default function NumbersAlignedStart() {
  return (
    // Numbers aligned to the start: hundreds and tens look alike at a glance.
    <Table.Root
      aria-label="Files, sizes aligned at the start"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Size (KB)</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {files.map((file) => (
          <Table.Row key={file.name}>
            <Table.Cell>{file.name}</Table.Cell>
            <Table.Cell>{file.size.toLocaleString('en')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
