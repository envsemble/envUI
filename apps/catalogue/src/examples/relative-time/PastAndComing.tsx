import { useState } from 'react';
import { RelativeTime, Stack, Text } from '@envsemble/envui';

const hour = 60 * 60_000;
const day = 24 * hour;

export default function PastAndComing() {
  // Moments around the time the page opened; the texts keep up with the clock from there.
  const [now] = useState(() => Date.now());
  const events = [
    { label: 'Quarterly report updated', at: now - 3 * hour },
    { label: 'Design review due', at: now + 2 * day },
    { label: 'Budget approved', at: now - 35 * day },
    { label: 'Contract renews', at: now + 300 * day },
  ];
  return (
    <Stack gap={2}>
      {events.map((event) => (
        <Text key={event.label}>
          {event.label} <RelativeTime value={event.at} />
        </Text>
      ))}
    </Stack>
  );
}
