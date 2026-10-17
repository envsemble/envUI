import { useState } from 'react';
import { List } from '@envsemble/envui';

const agenda = [
  { id: 'welcome', title: 'Welcome', length: '5 minutes' },
  { id: 'roadmap', title: 'Roadmap review', length: '20 minutes' },
  { id: 'budget', title: 'Budget', length: '15 minutes' },
  { id: 'questions', title: 'Questions', length: '10 minutes' },
];

export default function Reorder() {
  const [items, setItems] = useState(agenda);
  return (
    <List.Root
      aria-label="Agenda"
      // The list reports the move; the application moves the item in its own state.
      onReorder={(from, to) =>
        setItems((list) => {
          const next = [...list];
          const [item] = next.splice(from, 1);
          next.splice(to, 0, item!);
          return next;
        })
      }
    >
      {items.map(({ id, title, length }) => (
        <List.Item key={id} label={title} description={length} />
      ))}
    </List.Root>
  );
}
