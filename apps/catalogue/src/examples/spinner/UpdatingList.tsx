import { useState } from 'react';
import { List, SegmentedControl, Spinner, Stack } from '@envsemble/envui';

const tasks = [
  { id: 'brief', title: 'Write the launch brief', owner: 'Alex Morgan', done: true },
  { id: 'budget', title: 'Review the budget', owner: 'Priya Shah', done: false },
  { id: 'emails', title: 'Draft onboarding emails', owner: 'Sam Lee', done: false },
  { id: 'survey', title: 'Send the customer survey', owner: 'Sam Lee', done: true },
];
const views = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
];

export default function UpdatingList() {
  const [view, setView] = useState('open');
  const [shown, setShown] = useState('open');
  const updating = view !== shown;
  const choose = (next: string) => {
    setView(next);
    // The list loads from a server; a timer stands in for it here.
    window.setTimeout(() => setShown(next), 1200);
  };
  const visible = tasks.filter((task) => shown === 'all' || (shown === 'done') === task.done);
  return (
    <Stack gap={4}>
      <Stack direction="row" wrap align="center" gap={4}>
        <SegmentedControl
          aria-label="Show tasks"
          options={views}
          value={view}
          onValueChange={choose}
        />
        {/* The tasks shown stay while the new ones load; the spinner says they are updating. */}
        {updating && <Spinner size="small" label="Updating tasks" />}
      </Stack>
      <List.Root aria-label="Tasks" aria-busy={updating}>
        {visible.map((task) => (
          <List.Item key={task.id} label={task.title} description={task.owner} />
        ))}
      </List.Root>
    </Stack>
  );
}
