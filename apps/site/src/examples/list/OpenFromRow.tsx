import { useState } from 'react';
import { IconButton, Link, List, Column, Menu, Text } from '@envsemble/envui';
import { IconMoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

const plans = [
  { id: 'roadmap', name: 'Roadmap', updated: 'Updated today by Sam Lee' },
  { id: 'pricing', name: 'Pricing research', updated: 'Updated yesterday by Priya Shah' },
];

export default function OpenFromRow() {
  const [result, setResult] = useState('');
  return (
    <Column gap={3}>
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
            end={
              <Menu.Root
                aria-label={`Actions for ${name}`}
                trigger={
                  <IconButton
                    variant="text"
                    icon={<IconMoreHoriz />}
                    aria-label={`More actions for ${name}`}
                    // The row's other controls stay above the link that covers the row.
                    style={{ position: 'relative' }}
                  />
                }
              >
                <Menu.Item onClick={() => setResult(`Shared ${name}`)}>Share</Menu.Item>
                <Menu.Item onClick={() => setResult(`Renamed ${name}`)}>Rename</Menu.Item>
                <Menu.Item onClick={() => setResult(`Archived ${name}`)}>Archive</Menu.Item>
              </Menu.Root>
            }
          />
        ))}
      </List.Root>
      <Text variant="caption" emphasis="muted" role="status">
        {result}
      </Text>
    </Column>
  );
}
