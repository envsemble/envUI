import { useEffect, useRef, useState } from 'react';
import { Button, List, Menu, Stack, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Close } from '@envsemble/envui/icons/Close';

const taskCount = (count: number) => (count === 1 ? '1 task' : `${count} tasks`);

export default function ActiveFilters() {
  const [applied, setApplied] = useState<string[]>(['status:open', 'assignee:Sam Lee']);
  const tokens = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const addButton = () => bar.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]');
  // A removed token takes its button with it, so focus moves to the next token, or to Add filter
  // once none is left.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const filters = applied.map((id) => available.find((filter) => filter.id === id)!);
  const shown = tasks.filter((task) => filters.every((filter) => filter.test(task)));

  const remove = (id: string) => {
    const index = applied.indexOf(id);
    focusNext.current = () => {
      const buttons = tokens.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? addButton())?.focus();
    };
    setApplied((current) => current.filter((item) => item !== id));
  };

  return (
    <Stack gap={4}>
      <Stack ref={bar} direction="row" wrap align="center" gap={2}>
        {/* envUI has no removable filter token yet: each is a small secondary Button whose name
            says what pressing it does, and whose visible text is part of that name. */}
        <Stack
          ref={tokens}
          direction="row"
          wrap
          align="center"
          gap={2}
          role="group"
          aria-label="Filters in use"
        >
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant="secondary"
              size="sm"
              endIcon={<Close />}
              aria-label={`Remove filter ${filter.label}`}
              onClick={() => remove(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </Stack>
        <Menu.Root
          aria-label="Filters"
          trigger={
            <Button variant="text" size="sm" startIcon={<Add />}>
              Add filter
            </Button>
          }
        >
          {available
            .filter((filter) => !applied.includes(filter.id))
            .map((filter) => (
              <Menu.Item
                key={filter.id}
                onClick={() => setApplied((current) => [...current, filter.id])}
              >
                {filter.label}
              </Menu.Item>
            ))}
        </Menu.Root>
        {applied.length > 1 && (
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              setApplied([]);
              // The button goes with the filters, so focus moves to Add filter.
              focusNext.current = () => addButton()?.focus();
            }}
          >
            Clear filters
          </Button>
        )}
      </Stack>
      <Text role="status" variant="body-sm" emphasis="muted">
        {taskCount(shown.length)}
      </Text>
      <List.Root aria-label="Tasks">
        {shown.map((task) => (
          <List.Item
            key={task.name}
            label={task.name}
            description={`${task.assignee} · ${task.open ? 'Open' : 'Done'}`}
          />
        ))}
        {shown.length === 0 && <List.Item label="No tasks match these filters." />}
      </List.Root>
    </Stack>
  );
}

interface Task {
  name: string;
  assignee: string;
  open: boolean;
  project: string;
}

const available: { id: string; label: string; test: (task: Task) => boolean }[] = [
  { id: 'status:open', label: 'Status: Open', test: (task) => task.open },
  { id: 'status:done', label: 'Status: Done', test: (task) => !task.open },
  {
    id: 'assignee:Sam Lee',
    label: 'Assignee: Sam Lee',
    test: (task) => task.assignee === 'Sam Lee',
  },
  {
    id: 'assignee:Priya Shah',
    label: 'Assignee: Priya Shah',
    test: (task) => task.assignee === 'Priya Shah',
  },
  {
    id: 'project:Website refresh',
    label: 'Project: Website refresh',
    test: (task) => task.project === 'Website refresh',
  },
];

const tasks: Task[] = [
  { name: 'Write the home page', assignee: 'Sam Lee', open: true, project: 'Website refresh' },
  {
    name: 'Review the page inventory',
    assignee: 'Priya Shah',
    open: true,
    project: 'Website refresh',
  },
  { name: 'Check the figures', assignee: 'Sam Lee', open: true, project: 'Quarterly report' },
  { name: 'Draft the summary', assignee: 'Sam Lee', open: false, project: 'Quarterly report' },
  {
    name: 'Record the welcome video',
    assignee: 'Jordan Kim',
    open: true,
    project: 'Onboarding guide',
  },
];
