import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';

export default function ExactDateNearby() {
  const [sentAt] = useState(() => Date.now() - 2 * 24 * 60 * 60_000);
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(sentAt);
  return (
    <Text>
      Invoice sent on {date} {/* The relative time and its brackets stay on one line. */}
      <span style={{ whiteSpace: 'nowrap' }}>
        (<RelativeTime value={sentAt} tooltip={false} />)
      </span>
    </Text>
  );
}
