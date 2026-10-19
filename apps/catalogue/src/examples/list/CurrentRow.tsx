import { useState } from 'react';
import { Avatar, Link, List, Stack, Text } from '@envsemble/envui';

const people = [
  { id: 'alex', name: 'Alex Morgan', role: 'Design lead' },
  { id: 'sam', name: 'Sam Lee', role: 'Engineer' },
  { id: 'priya', name: 'Priya Shah', role: 'Product manager' },
];

export default function CurrentRow() {
  const [current, setCurrent] = useState('sam');
  const person = people.find((each) => each.id === current);
  return (
    <Stack gap={3}>
      <List.Root aria-label="People">
        {people.map(({ id, name, role }) => (
          <List.Item
            key={id}
            interactive
            selected={id === current}
            start={<Avatar name={name} size="sm" />}
            label={
              <Link
                href={`/people/${id}`}
                underline={false}
                data-row-target
                draggable={false}
                onClick={(event) => {
                  // The details show beside the list, so the link only chooses the row.
                  event.preventDefault();
                  setCurrent(id);
                }}
              >
                {name}
              </Link>
            }
            description={role}
          />
        ))}
      </List.Root>
      <Text variant="caption" emphasis="muted" role="status">
        Showing {person?.name}
      </Text>
    </Stack>
  );
}
