import { useState } from 'react';
import { List, Column, Switch } from '@envsemble/envui';

const tasks = [
  { id: 'brief', title: 'Write the launch brief', done: true },
  { id: 'review', title: 'Review the pricing page', done: false },
  { id: 'invite', title: 'Invite Priya Shah to Northwind', done: true },
  { id: 'schedule', title: 'Schedule the kickoff', done: false },
];

export default function ShowCompleted() {
  const [showCompleted, setShowCompleted] = useState(false);
  const shown = showCompleted ? tasks : tasks.filter((task) => !task.done);
  return (
    <Column gap={3}>
      <Column gap={4} align="start">
        <Switch
          label="Show completed tasks"
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
        />
      </Column>
      <List.Root aria-label="Tasks">
        {shown.map((task) => (
          <List.Item
            key={task.id}
            label={task.title}
            description={task.done ? 'Completed' : 'Open'}
          />
        ))}
      </List.Root>
    </Column>
  );
}
