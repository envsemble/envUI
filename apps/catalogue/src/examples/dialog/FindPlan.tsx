import { useState } from 'react';
import { Button, Dialog, List, SearchField, Column, Text } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

const plans = [
  { name: 'Launch plan', owner: 'Priya Shah' },
  { name: 'Hiring plan 2027', owner: 'Alex Morgan' },
  { name: 'Northwind roadmap', owner: 'Sam Lee' },
  { name: 'Office move', owner: 'Alex Morgan' },
  { name: 'Support rota', owner: 'Priya Shah' },
];

export default function FindPlan() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');
  const matches = plans.filter((plan) =>
    plan.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Column gap={4} align="start">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setQuery('');
        }}
        placement="top"
        trigger={
          <Button variant="secondary" startIcon={<Search />}>
            Find a plan
          </Button>
        }
        title="Find a plan"
      >
        <Column gap={4}>
          <SearchField label="Plan name" value={query} onValueChange={setQuery} />
          {matches.length > 0 ? (
            <List.Root aria-label="Matching plans">
              {matches.map((plan) => (
                <List.Item
                  key={plan.name}
                  interactive
                  label={
                    <Button
                      variant="text"
                      data-row-target
                      onClick={() => {
                        setOpened(plan.name);
                        setOpen(false);
                      }}
                    >
                      {plan.name}
                    </Button>
                  }
                  description={plan.owner}
                />
              ))}
            </List.Root>
          ) : (
            <Text emphasis="muted">No plans match “{query.trim()}”.</Text>
          )}
        </Column>
      </Dialog>
      <Text role="status">{opened && `Opened ${opened}`}</Text>
    </Column>
  );
}
