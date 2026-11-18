import { useRef, useState } from 'react';
import { Button, List, Column, Text, Sheet } from '@envsemble/envui';

const people = [
  { name: 'Alex Morgan', role: 'Designer', email: 'alex.morgan@example.com', team: 'Product' },
  { name: 'Sam Lee', role: 'Engineer', email: 'sam.lee@example.com', team: 'Infrastructure' },
  { name: 'Priya Shah', role: 'Project lead', email: 'priya.shah@example.com', team: 'Operations' },
];

export default function InspectorPanel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const person = people.find((candidate) => candidate.name === selected);
  return (
    <>
      <List.Root aria-label="People" style={{ inlineSize: 'min(100%, 24rem)' }}>
        {people.map((candidate) => (
          <List.Item
            key={candidate.name}
            interactive
            label={
              <Button
                variant="text"
                data-row-target
                aria-current={(open && candidate.name === selected) || undefined}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelected(candidate.name);
                  setOpen(true);
                }}
              >
                {candidate.name}
              </Button>
            }
            description={candidate.role}
          />
        ))}
      </List.Root>
      <Sheet
        open={open && person !== undefined}
        onOpenChange={setOpen}
        modal={false}
        disablePointerDismissal
        finalFocus={opener}
        title={person?.name ?? 'Person'}
        description={person?.role}
        closeLabel="Close details"
      >
        {person && (
          <Column gap={4}>
            <Column gap={1}>
              <Text variant="caption" emphasis="muted">
                Email
              </Text>
              <Text>{person.email}</Text>
            </Column>
            <Column gap={1}>
              <Text variant="caption" emphasis="muted">
                Team
              </Text>
              <Text>{person.team}</Text>
            </Column>
          </Column>
        )}
      </Sheet>
    </>
  );
}
