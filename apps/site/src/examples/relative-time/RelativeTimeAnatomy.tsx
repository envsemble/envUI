import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';

export default function RelativeTimeAnatomy() {
  const [savedAt] = useState(() => Date.now() - 20 * 60_000);
  return (
    <Text>
      Draft saved <RelativeTime value={savedAt} />
    </Text>
  );
}
