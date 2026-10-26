import { useState } from 'react';
import { List, SegmentedControl, Column } from '@envsemble/envui';

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
    <Column gap={4}>
      <Column gap={4} align="start">
        <SegmentedControl
          aria-label="Work items"
          value={status}
          onValueChange={setStatus}
          items={statuses.map((option) => ({
            ...option,
            count: items.filter((item) => item.status === option.value).length,
          }))}
        />
      </Column>
      <List.Root aria-label={`${statuses.find((option) => option.value === status)?.label} items`}>
        {items
          .filter((item) => item.status === status)
          .map((item) => (
            <List.Item key={item.id} label={item.title} />
          ))}
      </List.Root>
    </Column>
  );
}
