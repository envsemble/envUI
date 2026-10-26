import { useEffect, useRef, useState } from 'react';
import { Button, List, Spinner, Column, Row, Text } from '@envsemble/envui';

const activity = [
  { id: 'brief', text: 'Alex Morgan updated the brief', when: 'Today' },
  { id: 'budget', text: 'Priya Shah approved the budget', when: 'Yesterday' },
  { id: 'survey', text: 'Sam Lee sent the survey', when: 'Monday' },
];

export default function RefreshInPlace() {
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const refresh = () => {
    // The button stays enabled, so focus stays on it; a press while refreshing does nothing.
    if (refreshing) return;
    setRefreshing(true);
    // The activity loads from a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => setRefreshing(false), 1500);
  };
  return (
    <Column gap={4}>
      <Row align="center" justify="between" gap={4}>
        <Row align="center" gap={3}>
          <Text render={<h4 />} variant="title">
            Team activity
          </Text>
          {/* The activity shown stays while it refreshes; the spinner says it is updating. */}
          {refreshing && <Spinner size="sm" label="Refreshing activity" />}
        </Row>
        <Button variant="secondary" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </Row>
      <List.Root aria-label="Team activity" aria-busy={refreshing}>
        {activity.map((item) => (
          <List.Item key={item.id} label={item.text} description={item.when} />
        ))}
      </List.Root>
    </Column>
  );
}
