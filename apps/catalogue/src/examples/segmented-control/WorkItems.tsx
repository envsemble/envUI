import { useState } from 'react';
import { List, SegmentedControl, Stack } from '@envsemble/envui';

const items = [
  { id: 'brief', title: 'Write the launch brief', status: 'open' },
  { id: 'pricing', title: 'Review the pricing page', status: 'blocked' },
  { id: 'kickoff', title: 'Schedule the kickoff', status: 'open' },
  { id: 'invite', title: 'Invite Priya Shah', status: 'done' },
];
const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

export default function WorkItems() {
  const [status, setStatus] = useState('open');
  return (
    <Stack gap={4}>
      <Stack align="start">
        <SegmentedControl
          aria-label="Work items"
          value={status}
          onValueChange={setStatus}
          options={statuses.map((option) => ({
            ...option,
            count: items.filter((item) => item.status === option.value).length,
          }))}
        />
      </Stack>
      <List.Root aria-label={`${statuses.find((option) => option.value === status)?.label} items`}>
        {items
          .filter((item) => item.status === status)
          .map((item) => (
            <List.Item key={item.id} label={item.title} />
          ))}
      </List.Root>
    </Stack>
  );
}
