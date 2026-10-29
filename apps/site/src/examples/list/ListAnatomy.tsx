import { useState } from 'react';
import { Avatar, IconButton, List } from '@envsemble/envui';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

export default function ListAnatomy() {
  const [people, setPeople] = useState(['Priya Shah', 'Sam Lee']);
  return (
    <List.Root
      aria-label="Speakers"
      style={{ inlineSize: 'min(100%, 24rem)' }}
      onReorder={(from, to) =>
        setPeople((list) => {
          const next = [...list];
          const [person] = next.splice(from, 1);
          next.splice(to, 0, person!);
          return next;
        })
      }
    >
      {people.map((name) => (
        <List.Item
          key={name}
          start={<Avatar name={name} size="sm" />}
          label={name}
          description="10 minutes"
          end={<IconButton icon={<MoreHoriz />} aria-label={`More actions for ${name}`} />}
        />
      ))}
    </List.Root>
  );
}
