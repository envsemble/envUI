import { useState } from 'react';
import { ActionGroup, AnimatedNumber, Button, Checkbox, Stack } from '@envsemble/envui';

const statuses = [
  { value: 'open', label: 'Open', count: 24 },
  { value: 'review', label: 'In review', count: 9 },
  { value: 'done', label: 'Done', count: 95 },
];

export default function ShowResults() {
  const [chosen, setChosen] = useState(['open', 'review']);
  const total = statuses
    .filter(({ value }) => chosen.includes(value))
    .reduce((sum, { count }) => sum + count, 0);
  return (
    <Stack gap={4}>
      <Stack gap={2} role="group" aria-label="Status">
        {statuses.map(({ value, label }) => (
          <Checkbox
            key={value}
            label={label}
            checked={chosen.includes(value)}
            onCheckedChange={(checked) =>
              setChosen((current) =>
                checked ? [...current, value] : current.filter((item) => item !== value),
              )
            }
          />
        ))}
      </Stack>
      <ActionGroup>
        <Button disabled={total === 0}>
          Show <AnimatedNumber value={total} /> {total === 1 ? 'task' : 'tasks'}
        </Button>
      </ActionGroup>
    </Stack>
  );
}
