import { useEffect, useRef, useState } from 'react';
import { Column, List, Row, SegmentedControl, Spinner } from '@envsemble/envui';

const tasks = [
  { id: 'brief', title: 'Write the launch brief', owner: 'Alex Morgan', done: true },
  { id: 'budget', title: 'Review the budget', owner: 'Priya Shah', done: false },
  { id: 'emails', title: 'Draft onboarding emails', owner: 'Sam Lee', done: false },
];
const views = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

export default function UpdatingList() {
  // Starts updating, so the figure shows the spinner beside the choice.
  const [view, setView] = useState('done');
  const [shown, setShown] = useState('open');
  const timer = useRef<number>(undefined);
  const updating = view !== shown;
  const load = (next: string) => {
    window.clearTimeout(timer.current);
    // The list loads from a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => setShown(next), 2500);
  };
  useEffect(() => {
    load('done');
    return () => window.clearTimeout(timer.current);
  }, []);
  const choose = (next: string) => {
    setView(next);
    load(next);
  };
  const visible = tasks.filter((task) => (shown === 'done') === task.done);
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Row wrap align="center" gap={4}>
        <SegmentedControl
          aria-label="Show tasks"
          items={views}
          value={view}
          onValueChange={choose}
        />
        {/* The tasks shown stay while the new ones load; the spinner says they are updating. */}
        {updating && <Spinner size="sm" label="Updating tasks" />}
      </Row>
      <List.Root aria-label="Tasks" aria-busy={updating}>
        {visible.map((task) => (
          <List.Item key={task.id} label={task.title} description={task.owner} />
        ))}
      </List.Root>
    </Column>
  );
}
