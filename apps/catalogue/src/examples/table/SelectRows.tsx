import { useState } from 'react';
import { Checkbox, Column, Table, Text } from '@envsemble/envui';

const members = [
  { id: 'alex', name: 'Alex Morgan', email: 'alex@example.com', role: 'Owner' },
  { id: 'sam', name: 'Sam Lee', email: 'sam@example.com', role: 'Editor' },
  { id: 'priya', name: 'Priya Shah', email: 'priya@example.com', role: 'Editor' },
  { id: 'jordan', name: 'Jordan Kim', email: 'jordan@example.com', role: 'Viewer' },
];

export default function SelectRows() {
  const [selected, setSelected] = useState(['sam']);
  const select = (id: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, id] : current.filter((selectedId) => selectedId !== id),
    );
  return (
    <Column gap={3}>
      <Text emphasis="muted">
        {selected.length} of {members.length} selected
      </Text>
      <Table.Root aria-label="Members">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {members.map((member) => (
            // Every row reports its state, selected or not.
            <Table.Row key={member.id} selected={selected.includes(member.id)}>
              <Table.Cell>
                <Checkbox
                  label={member.name}
                  checked={selected.includes(member.id)}
                  onCheckedChange={(checked) => select(member.id, checked)}
                />
              </Table.Cell>
              <Table.Cell>{member.email}</Table.Cell>
              <Table.Cell>{member.role}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}
