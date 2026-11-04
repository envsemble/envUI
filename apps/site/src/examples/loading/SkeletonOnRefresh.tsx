import { useEffect, useRef, useState } from 'react';
import { Button, Column, List, Row, Text, placeholders } from '@envsemble/envui';

interface Activity {
  id: string;
  text: string;
  when: string;
}

const activity: Activity[] = [
  { id: 'brief', text: 'Alex Morgan updated the brief', when: 'Today' },
  { id: 'budget', text: 'Priya Shah approved the budget', when: 'Yesterday' },
  { id: 'survey', text: 'Sam Lee sent the survey', when: 'Monday' },
];

export default function SkeletonOnRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timer.current = window.setTimeout(() => setRefreshing(false), 1500);
  };
  return (
    <Column gap={4}>
      <Row align="center" justify="between" gap={4}>
        <Text render={<h4 />} variant="title">
          Team activity
        </Text>
        <Button variant="secondary" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </Row>
      {/* The activity people were reading, turned back into a skeleton while it refreshes. */}
      <List.Root aria-label="Team activity" skeleton={refreshing}>
        {(refreshing ? placeholders<Activity>(3) : activity).map((item) => (
          <List.Item key={item.id} label={item.text} description={item.when} />
        ))}
      </List.Root>
    </Column>
  );
}
