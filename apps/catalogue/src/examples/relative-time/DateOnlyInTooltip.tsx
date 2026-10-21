import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';

export default function DateOnlyInTooltip() {
  const [sentAt] = useState(() => Date.now() - 2 * 24 * 60 * 60_000);
  return (
    <Text>
      Invoice sent <RelativeTime value={sentAt} />
    </Text>
  );
}
