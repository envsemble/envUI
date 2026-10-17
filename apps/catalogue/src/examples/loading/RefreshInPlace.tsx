import { useEffect, useRef, useState } from 'react';
import { Button, List, Spinner, Stack, Text } from '@envsemble/envui';

const activity = [
  { id: 'brief', text: 'Alex Morgan updated the launch brief', when: 'Today' },
  { id: 'budget', text: 'Priya Shah approved the budget', when: 'Yesterday' },
  { id: 'survey', text: 'Sam Lee sent the customer survey', when: 'Monday' },
];

export default function RefreshInPlace() {
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const refresh = () => {
    setRefreshing(true);
    // The activity loads from a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => setRefreshing(false), 1500);
  };
  return (
    <Stack gap={4}>
      <Stack direction="row" align="center" justify="between" gap={4}>
        <Stack direction="row" align="center" gap={3}>
          <Text render={<h3 />} variant="title">
            Team activity
          </Text>
          {/* The activity shown stays while it refreshes; the spinner says it is updating. */}
          {refreshing && <Spinner size="sm" label="Refreshing activity" />}
        </Stack>
        <Button variant="secondary" size="sm" disabled={refreshing} onClick={refresh}>
          Refresh
        </Button>
      </Stack>
      <List.Root aria-label="Team activity" aria-busy={refreshing}>
        {activity.map((item) => (
          <List.Item key={item.id} label={item.text} description={item.when} />
        ))}
      </List.Root>
    </Stack>
  );
}
