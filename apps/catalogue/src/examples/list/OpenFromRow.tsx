import { useState } from 'react';
import { IconButton, Link, List, Stack, Text } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

const plans = [
  { id: 'roadmap', name: 'Roadmap', updated: 'Updated today by Sam Lee' },
  { id: 'pricing', name: 'Pricing research', updated: 'Updated yesterday by Priya Shah' },
];

export default function OpenFromRow() {
  const [result, setResult] = useState('');
  return (
    <Stack gap={3}>
      <List.Root aria-label="Recent plans">
        {plans.map(({ id, name, updated }) => (
          <List.Item
            key={id}
            interactive
            label={
              // data-row-target stretches the link over the row; draggable={false} keeps a press
              // that moves a little from dragging the link instead of opening it.
              <Link
                href={`/plans/${id}`}
                underline={false}
                data-row-target
                draggable={false}
                onClick={() => setResult(`Opened ${name}`)}
              >
                {name}
              </Link>
            }
            description={updated}
            action={
              <IconButton
                variant="text"
                icon={<MoreHoriz />}
                aria-label={`More actions for ${name}`}
                // The row's other controls stay above the link that covers the row.
                style={{ position: 'relative' }}
                onClick={() => setResult(`More actions for ${name}`)}
              />
            }
          />
        ))}
      </List.Root>
      <Text variant="caption" emphasis="muted" role="status">
        {result}
      </Text>
    </Stack>
  );
}
