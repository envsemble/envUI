import { useState } from 'react';
import { Button, Checkbox, Popover, Column, Row, Text } from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

export default function FilterTasks() {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<string[]>([]);
  const [draft, setDraft] = useState<string[]>([]);
  const toggle = (person: string, checked: boolean) =>
    setDraft((current) =>
      checked ? [...current, person] : current.filter((name) => name !== person),
    );
  return (
    <Column gap={3} align="start">
      <Popover
        title="Assignees"
        align="start"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // Each time it opens, the popover starts from the filters in use.
          if (next) setDraft(applied);
        }}
        trigger={
          <Button variant="secondary" startIcon={<FilterList />}>
            {applied.length ? `Assignees (${applied.length})` : 'Assignees'}
          </Button>
        }
      >
        <Column gap={3}>
          {people.map((person) => (
            <Checkbox
              key={person}
              label={person}
              checked={draft.includes(person)}
              onCheckedChange={(checked) => toggle(person, checked)}
            />
          ))}
        </Column>
        <Row wrap align="center" gap={4} justify="end">
          <Button variant="secondary" onClick={() => setDraft([])}>
            Clear
          </Button>
          <Button
            onClick={() => {
              setApplied(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </Row>
      </Popover>
      <Text variant="body-sm">
        {applied.length ? `Showing tasks for ${applied.join(', ')}.` : 'Showing every task.'}
      </Text>
    </Column>
  );
}
