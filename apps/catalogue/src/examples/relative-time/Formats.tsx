import { useState } from 'react';
import { RelativeTime, Column, Text } from '@envsemble/envui';

export default function Formats() {
  const [updatedAt] = useState(() => Date.now() - 3 * 60 * 60_000);
  return (
    <Column gap={2}>
      <Text>
        Updated <RelativeTime value={updatedAt} />
      </Text>
      <Text>
        Updated <RelativeTime value={updatedAt} format="short" />
      </Text>
      <Text>
        Updated <RelativeTime value={updatedAt} format="narrow" />
      </Text>
    </Column>
  );
}
