import { useState } from 'react';
import { RelativeTime, Column, Text } from '@envsemble/envui';

const hourMs = 60 * 60_000;
const dayMs = 24 * hourMs;

export default function PastAndComing() {
  const [now] = useState(() => Date.now());
  const events = [
    { label: 'Quarterly report updated', at: now - 3 * hourMs },
    { label: 'Design review due', at: now + 2 * dayMs },
    { label: 'Budget approved', at: now - 35 * dayMs },
    { label: 'Contract renews', at: now + 300 * dayMs },
  ];
  return (
    <Column gap={2}>
      {events.map((event) => (
        <Text key={event.label}>
          {event.label} <RelativeTime value={event.at} />
        </Text>
      ))}
    </Column>
  );
}
