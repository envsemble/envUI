import { useState } from 'react';
import { ActionGroup, AnimatedNumber, Button, Checkbox, Stack } from '@envsemble/envui';

const filters = [
  { id: 'garden', label: 'Garden', matching: 0.4 },
  { id: 'parking', label: 'Parking', matching: 0.6 },
  { id: 'pets', label: 'Pets allowed', matching: 0.5 },
];

export default function SayWhatWillHappen() {
  const [chosen, setChosen] = useState<string[]>([]);
  const homes = filters.reduce(
    (count, filter) => (chosen.includes(filter.id) ? Math.round(count * filter.matching) : count),
    1280,
  );
  return (
    <Stack>
      <Stack gap={3}>
        {filters.map((filter) => (
          <Checkbox
            key={filter.id}
            label={filter.label}
            checked={chosen.includes(filter.id)}
            onCheckedChange={(checked) =>
              setChosen((current) =>
                checked ? [...current, filter.id] : current.filter((id) => id !== filter.id),
              )
            }
          />
        ))}
      </Stack>
      <ActionGroup>
        <Button>
          Show <AnimatedNumber value={homes} /> homes
        </Button>
      </ActionGroup>
    </Stack>
  );
}
