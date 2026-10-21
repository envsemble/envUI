import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';

export default function TimeAlone() {
  const [updatedAt] = useState(() => Date.now() - 3 * 60 * 60_000);
  return (
    <Text>
      <RelativeTime value={updatedAt} />
    </Text>
  );
}
